import numpy as np
import pandas as pd
import yfinance as yf
import logging
import warnings

def get_historical_data (tickers: list, start_date: str, end_date: str):
    """
    Fetches historical stock data between start and end date and returns
    data frame of daily returns 
    """
    data = yf.download(tickers, start_date, end_date, auto_adjust = True)['Close']
    returns = data.pct_change().dropna(how = 'all')
    if returns.empty:
        raise ValueError("No return data recieved - check inputs")
    return returns

def optimize(returns_df: pd.DataFrame, max_weight: float, **kwargs):
    """
    Optimizes portfolio risk using 95% historical VaR scaling where position sizes
    are inversely proportional to each asset's 95% historical VaR
    
    Args: 
    returns_df: data frame of historical asset returns w/ one column -> one asset
    max_weight: maximum allowable weight of any single asset
    confidence level: VaR threshold
    *kwargs: optional parameters -
                - confidence level (float)
                - min_weight (float)
    
    Returns: pd.Series - normalized asset weights summing to 1.0
    
    Raises: ValueError if weight constraints mutually infeasible
    """
    min_weight = kwargs.get('min_weight', None)
    confidence_level = kwargs.get('confidence_level', 0.05)
    n_assets = len(returns_df.columns)
    if min_weight is None:
        min_weight = 1.0/(2* n_assets)
    
    if min_weight * n_assets > 1.0:
        raise ValueError(
            f"min weight ({min_weight:.4f }) x n_assets ({n_assets}) > 1.0 "
        )
    if max_weight < min_weight:
        raise ValueError(
            f"max_weight ({max_weight}) must be >= min_weight({min_weight})"
        )
    #Converts 5% percentile return into a positive risk scalar
    var_95 = returns_df.quantile(confidence_level).abs()

    # Tests to see if any var_95 is 0 across the list of positions, if so, returns a notice
    # and then replaces with fallback value of the min variance or 1*10^-6

    if (var_95 == 0).any():
        fallback = var_95[var_95 > 0].min() or 1e-6
        warnings.warn(f"Zero VaR detected. Replacing with {fallback:.6f}.", UserWarning, stacklevel=2)
        var_95 = var_95.replace(0, fallback)
    
    inv_var = 1.0/var_95
    weights = inv_var / inv_var.sum()
    
    if (weights < min_weight).any():
        weights = apply_weight_floor(weights, min_weight)
   
    if (weights > max_weight).any():
        weights = apply_weight_cap(weights, max_weight, min_weight)
    
    weights = weights/weights.sum()
    return weights 

def apply_weight_floor(weights: pd.Series, min_weight: float):
    """
    Raises assets below minimum weight to the floor by drawing from assets
    above the floor

    Args: 
        weights: current weights
        min_weight: minimum allowable weight per asset
    Returns:
        pd.Series: weight series of all values >= min_weight, summing to 1.0
    """
    w = weights.copy()
    for _ in range (100):
        below_mask = w < min_weight
        if not below_mask.any():
            break
        deficit = (min_weight - w[below_mask]).sum()
        above_mask = w > min_weight
        w[below_mask] = min_weight
        if not above_mask.any():
            w[:] = min_weight
            break
        w[above_mask] -= w[above_mask]/w[above_mask].sum()*deficit
    else:
        warnings.warn("apply_weight_floor did not converge in 100 iterations")
    return w/w.sum()

def apply_weight_cap(weights: pd.Series, max_weight : float, min_weight: float = 0.0):
    """
    Lowers assets above maximum weight to the floor by distributing proportionally 
    to assets between the min and max weight

    Args: 
        weights: current weights
        min_weight: minimum allowable weight per asset
        max_weight: max allowable weight per asset
    Returns:
        pd.Series: weight series of all values >= min_weight, summing to 1.0
    Raises:
        ValueError if surplus cannot be redistributed in 100 iterations
    """
    w = weights.copy()
    
    for its in range (100):
        over_mask = w > max_weight + 1e-9
        if not over_mask.any():
            break
        surplus = (w[over_mask] - max_weight).sum()
        w[over_mask] = max_weight
        headroom_mask = (w < max_weight - 1e-9) & (w >= min_weight)
        if not headroom_mask.any():
            raise ValueError(
                f"Weight cap infeasible at iteration {its + 1}:"
                f"Surplus = {surplus:6f}"
                f"Check max_weight({max_weight}) >= 1/n_assets ({1/len(w):4f})"
            )
        w[headroom_mask] += w[headroom_mask]/ w[headroom_mask].sum()*surplus
    else:
        raise ValueError(
            f"apply_weight_cap did not converge after 100 iterations. "
            f"Verify max_weight ({max_weight}) and min_weight ({min_weight}) "
            f"are feasible for {len(w)} assets"
        )

    return w/w.sum()








