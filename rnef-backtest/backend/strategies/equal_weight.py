import numpy as np
import pandas as pd


def optimize(returns_df: pd.DataFrame, **kwargs) -> np.ndarray:
    """Equal weight — naive 1/N benchmark."""
    n = returns_df.shape[1]
    return np.ones(n) / n