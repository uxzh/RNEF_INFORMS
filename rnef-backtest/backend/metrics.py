import numpy as np
import pandas as pd


def apply_tx_cost(weights_before: np.ndarray, weights_after: np.ndarray, tx_cost_bps: int) -> float:
    turnover = np.sum(np.abs(weights_after - weights_before))
    return turnover * (tx_cost_bps / 10_000)


def compute_metrics(weights: np.ndarray, returns_df: pd.DataFrame, tx_cost_bps: int):
    mean_ret = returns_df.mean().values
    cov = returns_df.cov().values
    equal = np.ones(len(weights)) / len(weights)

    port_return = float(np.dot(weights, mean_ret) * 252)
    port_vol = float(np.sqrt(weights @ cov @ weights * 252))
    sharpe = port_return / port_vol if port_vol > 0 else 0.0

    cost = apply_tx_cost(equal, weights, tx_cost_bps)
    port_return_net = port_return - cost * 252

    return round(port_return_net, 4), round(port_vol, 4), round(sharpe, 4)


def compute_time_series(weights: np.ndarray, returns_df: pd.DataFrame, tx_cost_bps: int):
    """Return equity curve, drawdown series, monthly returns and derived metrics."""
    port_returns = returns_df.values @ weights

    # Apply tx cost as a one-time drag on the first period
    equal = np.ones(len(weights)) / len(weights)
    cost = apply_tx_cost(equal, weights, tx_cost_bps)
    port_returns = port_returns.copy()
    if len(port_returns) > 0:
        port_returns[0] -= cost

    # Equity curve rebased to 100
    equity = 100.0 * np.cumprod(1 + port_returns)

    # Drawdown
    peak = np.maximum.accumulate(equity)
    dd_series = equity / peak - 1
    max_dd = float(dd_series.min())

    # Annualised return and Calmar
    n = len(equity)
    total_ret = equity[-1] / 100.0 if n > 0 else 1.0
    ann_return = float(total_ret ** (252.0 / n) - 1) if n >= 2 else 0.0
    calmar = round(ann_return / abs(max_dd), 4) if max_dd < 0 else 0.0

    # Turnover vs equal weight (one-way)
    turnover = round(float(np.sum(np.abs(weights - equal))), 4)

    dates = [str(d)[:10] for d in returns_df.index]
    equity_curve = [{"date": d, "value": round(float(v), 4)} for d, v in zip(dates, equity)]
    drawdown_out = [{"date": d, "drawdown": round(float(v), 6)} for d, v in zip(dates, dd_series)]

    # Monthly returns — group by year/month to avoid resampling freq string issues
    port_series = pd.Series(port_returns, index=returns_df.index)
    monthly_grouped = port_series.groupby([port_series.index.year, port_series.index.month]).apply(
        lambda x: float((1 + x).prod() - 1)
    )
    monthly_returns = [
        {"year": int(ym[0]), "month": int(ym[1]), "value": round(float(v), 6)}
        for ym, v in monthly_grouped.items()
    ]

    return equity_curve, drawdown_out, monthly_returns, round(max_dd, 4), calmar, turnover