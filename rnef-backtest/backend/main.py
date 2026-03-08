from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import numpy as np
import yfinance as yf
from scipy.optimize import minimize
import uuid
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Types ────────────────────────────────────────────────────────────────────

StrategyId = Literal["max-sharpe", "min-vol", "hrp", "var-scaled", "equal-weight"]
RebalanceFreq = Literal["monthly", "quarterly", "annual"]

# Hardcoded fund tickers — replace with your actual holdings
FUND_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B", "JPM", "JNJ"]

class DateRange(BaseModel):
    start: str
    end: str

class BacktestConfig(BaseModel):
    name: str
    strategies: List[StrategyId]
    dateRange: DateRange
    txCostBps: int
    rebalance: RebalanceFreq
    maxWeight: float
    walkForward: bool

class StrategyResult(BaseModel):
    strategyId: StrategyId
    weights: dict[str, float]
    expectedReturn: float
    expectedVolatility: float
    sharpeRatio: float

class BacktestRun(BaseModel):
    id: str
    name: str
    status: Literal["complete", "running", "failed"]
    createdAt: str
    strategies: List[StrategyId]
    dateRange: DateRange
    txCost: int
    rebalance: RebalanceFreq
    bestSharpe: Optional[float]
    results: List[StrategyResult]

# ── Optimization helpers ─────────────────────────────────────────────────────

def fetch_returns(tickers: List[str], start: str, end: str):
    data = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)["Close"]
    if data.empty:
        raise ValueError("No price data returned. Check tickers and date range.")
    data = data[tickers] if len(tickers) > 1 else data
    return data.pct_change().dropna()


def apply_tx_cost(weights_before: np.ndarray, weights_after: np.ndarray, tx_cost_bps: int) -> float:
    turnover = np.sum(np.abs(weights_after - weights_before))
    return turnover * (tx_cost_bps / 10_000)


def optimize_max_sharpe(mean_ret: np.ndarray, cov: np.ndarray, max_weight: float) -> np.ndarray:
    n = len(mean_ret)
    def neg_sharpe(w):
        r = np.dot(w, mean_ret) * 252
        v = np.sqrt(w @ cov @ w * 252)
        return -r / v if v > 0 else 0
    result = minimize(
        neg_sharpe, np.ones(n) / n, method="SLSQP",
        bounds=[(0, max_weight)] * n,
        constraints={"type": "eq", "fun": lambda w: np.sum(w) - 1},
    )
    return result.x if result.success else np.ones(n) / n


def optimize_min_vol(mean_ret: np.ndarray, cov: np.ndarray, max_weight: float) -> np.ndarray:
    n = len(mean_ret)
    result = minimize(
        lambda w: np.sqrt(w @ cov @ w * 252),
        np.ones(n) / n, method="SLSQP",
        bounds=[(0, max_weight)] * n,
        constraints={"type": "eq", "fun": lambda w: np.sum(w) - 1},
    )
    return result.x if result.success else np.ones(n) / n


def optimize_hrp(returns_df) -> np.ndarray:
    vols = returns_df.std().values
    inv_vol = 1.0 / np.where(vols > 0, vols, 1e-8)
    return inv_vol / inv_vol.sum()


def optimize_var_scaled(returns_df, max_weight: float) -> np.ndarray:
    vols = returns_df.var().values
    inv_var = 1.0 / np.where(vols > 0, vols, 1e-8)
    weights = np.clip(inv_var / inv_var.sum(), 0, max_weight)
    return weights / weights.sum()


def optimize_equal_weight(n: int) -> np.ndarray:
    return np.ones(n) / n


def run_strategy(strategy_id: StrategyId, returns_df, max_weight: float) -> np.ndarray:
    mean_ret = returns_df.mean().values
    cov = returns_df.cov().values
    n = returns_df.shape[1]
    dispatch = {
        "max-sharpe":   lambda: optimize_max_sharpe(mean_ret, cov, max_weight),
        "min-vol":      lambda: optimize_min_vol(mean_ret, cov, max_weight),
        "hrp":          lambda: optimize_hrp(returns_df),
        "var-scaled":   lambda: optimize_var_scaled(returns_df, max_weight),
        "equal-weight": lambda: optimize_equal_weight(n),
    }
    return dispatch[strategy_id]()


def compute_metrics(weights: np.ndarray, returns_df, tx_cost_bps: int):
    mean_ret = returns_df.mean().values
    cov = returns_df.cov().values
    equal = np.ones(len(weights)) / len(weights)
    port_return = float(np.dot(weights, mean_ret) * 252)
    port_vol = float(np.sqrt(weights @ cov @ weights * 252))
    sharpe = port_return / port_vol if port_vol > 0 else 0.0
    cost = apply_tx_cost(equal, weights, tx_cost_bps)
    port_return_net = port_return - cost * 252
    return round(port_return_net, 4), round(port_vol, 4), round(sharpe, 4)

# ── Route ────────────────────────────────────────────────────────────────────

@app.post("/backtest", response_model=BacktestRun)
async def run_backtest(config: BacktestConfig):
    if not config.strategies:
        raise HTTPException(status_code=400, detail="Select at least one strategy.")

    try:
        returns_df = fetch_returns(FUND_TICKERS, config.dateRange.start, config.dateRange.end)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data fetch failed: {e}")

    tickers = list(returns_df.columns)
    strategy_results: List[StrategyResult] = []

    for strategy_id in config.strategies:
        try:
            weights = run_strategy(strategy_id, returns_df, config.maxWeight)
            exp_return, exp_vol, sharpe = compute_metrics(weights, returns_df, config.txCostBps)
            strategy_results.append(StrategyResult(
                strategyId=strategy_id,
                weights={t: round(float(w), 4) for t, w in zip(tickers, weights)},
                expectedReturn=exp_return,
                expectedVolatility=exp_vol,
                sharpeRatio=sharpe,
            ))
        except Exception as e:
            print(f"Strategy {strategy_id} failed: {e}")

    if not strategy_results:
        raise HTTPException(status_code=500, detail="All strategies failed to optimize.")

    return BacktestRun(
        id=str(uuid.uuid4()),
        name=config.name or f"Backtest {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        status="complete",
        createdAt=datetime.now().strftime("%Y-%m-%d %H:%M"),
        strategies=config.strategies,
        dateRange=config.dateRange,
        txCost=config.txCostBps,
        rebalance=config.rebalance,
        bestSharpe=round(max(r.sharpeRatio for r in strategy_results), 2),
        results=strategy_results,
    )