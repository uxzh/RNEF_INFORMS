import numpy as np
import pandas as pd
def optimize(returns_df: pd.DataFrame, **kwargs) -> pd.Series:
    """
    Equal weight — naive 1/N benchmark.
    Returns a pandas Series with tickers as index.
    """
    n_assets = len(returns_df.columns)
    weights = np.ones(n_assets) / n_assets
    return pd.Series(weights, index=returns_df.columns)
