from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import uuid
from datetime import datetime

from data import fetch_returns
from metrics import compute_metrics
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

StrategyId = Literal["max-sharpe", "min-vol", "hrp", "var-scaled", "equal-weight"]
RebalanceFreq = Literal["monthly", "quarterly", "annual"]

# ── Models ────────────────────────────────────────────────────────────────────

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

# ── Route ─────────────────────────────────────────────────────────────────────

@app.post("/backtest", response_model=BacktestRun)
async def run_backtest(config: BacktestConfig):
    print(config.model_dump())

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