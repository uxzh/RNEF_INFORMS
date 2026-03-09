import numpy as np
import pandas as pd


def optimize(returns_df: pd.DataFrame, max_weight: float, **kwargs) -> np.ndarray:
    """Variance-scaled — position sizes inversely proportional to variance."""
    variances = returns_df.var().values
    inv_var = 1.0 / np.where(variances > 0, variances, 1e-8)
    weights = np.clip(inv_var / inv_var.sum(), 0, max_weight)
    return weights / weights.sum()