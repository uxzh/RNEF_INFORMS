from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timedelta
import numpy as np

from data import fetch_returns
from metrics import compute_metrics, compute_time_series
from strategies import run_strategy

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ────────────────────────────────────────────────────────────────────

FUND_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B", "JPM", "JNJ"]
BENCHMARK_TICKER = "ICLN"

StrategyId = Literal["max-sharpe", "min-vol", "hrp", "var-scaled", "equal-weight"]
RebalanceFreq = Literal["monthly", "quarterly", "annual"]

# ── Models ────────────────────────────────────────────────────────────────────

class DateRange(BaseModel):
    start: str
    end: str

class BacktestConfig(BaseModel):
    name: str
    strategies: List[StrategyId]
    tickers: List[str] = []
    dateRange: DateRange
    txCostBps: int
    rebalance: RebalanceFreq
    maxWeight: float
    walkForward: bool

class StrategyResult(BaseModel):
    strategyId: StrategyId
    weights: dict[str, float]
    lastPrices: dict[str, float]
    expectedReturn: float
    expectedVolatility: float
    sharpeRatio: float
    maxDD: float
    calmar: float
    turnover: float
    equityCurve: list[dict]
    drawdown: list[dict]
    monthlyReturns: list[dict]

class ValidateRequest(BaseModel):
    tickers: List[str]
    start: Optional[str] = None
    end: Optional[str] = None

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
    benchmarkCurve: list[dict] = []

# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/validate")
async def validate_tickers(req: ValidateRequest):
    import yfinance as yf
    end = req.end or datetime.now().strftime("%Y-%m-%d")
    start = req.start or (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    try:
        data = yf.download(req.tickers, start=start, end=end, auto_adjust=True, progress=False)["Close"]
        if data.empty:
            return {"valid": [], "invalid": req.tickers}
        if len(req.tickers) == 1:
            has_data = not data.dropna().empty
            valid = req.tickers if has_data else []
        else:
            valid = [t for t in req.tickers if t in data.columns and not data[t].dropna().empty]
        invalid = [t for t in req.tickers if t not in valid]
        return {"valid": valid, "invalid": invalid}
    except Exception:
        return {"valid": [], "invalid": req.tickers}


@app.post("/backtest", response_model=BacktestRun)
async def run_backtest(config: BacktestConfig):
    print(config.model_dump())

    if not config.strategies:
        raise HTTPException(status_code=400, detail="Select at least one strategy.")

    tickers = config.tickers if config.tickers else FUND_TICKERS
    try:
        returns_df, last_prices = fetch_returns(tickers, config.dateRange.start, config.dateRange.end)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data fetch failed: {e}")

    tickers = list(returns_df.columns)
    strategy_results: List[StrategyResult] = []

    for strategy_id in config.strategies:
        try:
            weights = run_strategy(strategy_id, returns_df, config.maxWeight)
            exp_return, exp_vol, sharpe = compute_metrics(weights, returns_df, config.txCostBps)
            equity_curve, drawdown, monthly_returns, max_dd, calmar, turnover = compute_time_series(
                weights, returns_df, config.txCostBps
            )
            strategy_results.append(StrategyResult(
                strategyId=strategy_id,
                weights={t: round(float(w), 4) for t, w in zip(tickers, weights)},
                lastPrices=last_prices,
                expectedReturn=exp_return,
                expectedVolatility=exp_vol,
                sharpeRatio=sharpe,
                maxDD=max_dd,
                calmar=calmar,
                turnover=turnover,
                equityCurve=equity_curve,
                drawdown=drawdown,
                monthlyReturns=monthly_returns,
            ))
        except Exception as e:
            print(f"Strategy {strategy_id} failed: {e}")

    if not strategy_results:
        raise HTTPException(status_code=500, detail="All strategies failed to optimize.")

    # Fetch benchmark equity curve (ICLN), non-fatal if it fails
    benchmark_curve: list[dict] = []
    try:
        bench_returns, _ = fetch_returns([BENCHMARK_TICKER], config.dateRange.start, config.dateRange.end)
        bench_equity = 100.0 * np.cumprod(1 + bench_returns.values.flatten())
        bench_dates = [str(d)[:10] for d in bench_returns.index]
        benchmark_curve = [{"date": d, "value": round(float(v), 4)} for d, v in zip(bench_dates, bench_equity)]
    except Exception as e:
        print(f"Benchmark fetch failed: {e}")

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
        benchmarkCurve=benchmark_curve,
    )