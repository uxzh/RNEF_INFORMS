import numpy as np
import pandas as pd
import yfinance as yf
import logging
import warnings
from scipy.optimize import minimize

def get_historical_data(tickers: list, start_date: str, end_date: str):
    """
    Fetches historical stock data between start and end date and returns
    data frame of daily returns 
    """
    data = yf.download(tickers, start_date, end_date, auto_adjust=True)['Close']
    returns = data.pct_change().dropna(how='all')
    if returns.empty:
        raise ValueError("No return data received - check inputs")
    return returns


def optimize(returns_df: pd.DataFrame, max_weight: float, **kwargs):
    """
    Optimizes portfolio risk using 95% historical VaR scaling where position sizes
    are inversely proportional to each asset's 95% historical VaR

    Args:
        returns_df: data frame of historical asset returns w/ one column -> one asset
        max_weight: maximum allowable weight of any single asset
        **kwargs:
            - confidence_level (float): VaR threshold, default 0.05
            - min_weight (float): minimum allowable weight per asset

    Returns: pd.Series - normalized asset weights summing to 1.0
    Raises:  ValueError if weight constraints are mutually infeasible
    """
    confidence_level = kwargs.get('confidence_level', 0.05)
    n_assets = len(returns_df.columns)
    min_weight = kwargs.get('min_weight', 1.0 / (2 * n_assets))

    if min_weight * n_assets > 1.0:
        raise ValueError(
            f"min_weight ({min_weight:.4f}) x n_assets ({n_assets}) > 1.0"
        )
    if max_weight < min_weight:
        raise ValueError(
            f"max_weight ({max_weight}) must be >= min_weight ({min_weight})"
        )

    # Converts 5th percentile return into a positive risk scalar
    var_95 = returns_df.quantile(confidence_level).abs()

    if (var_95 == 0).any():
        fallback = var_95[var_95 > 0].min() or 1e-6
        warnings.warn(f"Zero VaR detected. Replacing with {fallback:.6f}.", UserWarning, stacklevel=2)
        var_95 = var_95.replace(0, fallback)

    # Objective: minimize the weighted sum of VaR across all assets
    objective = lambda w: np.dot(w, var_95)

    constraints = [
        {'type': 'eq', 'fun': lambda w: w.sum() - 1.0}   # weights must sum to 1
    ]

    bounds = [(min_weight, max_weight)] * n_assets        # per-asset weight limits

    # Seed solver with inverse-VaR weights 
    inv_var = 1.0 / var_95
    w0 = (inv_var / inv_var.sum()).clip(min_weight, max_weight)
    w0 /= w0.sum()

    result = minimize(
        objective,
        x0=w0,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints,
        options={'ftol': 1e-9, 'maxiter': 1000}
    )

    if not result.success:
        raise ValueError(f"Optimization failed: {result.message}")

    weights = pd.Series(result.x / result.x.sum(), index=returns_df.columns)
    return weights