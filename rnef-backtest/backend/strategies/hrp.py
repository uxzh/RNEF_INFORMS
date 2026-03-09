import numpy as np
import pandas as pd


def optimize(returns_df: pd.DataFrame, **kwargs) -> np.ndarray:
    """Hierarchical Risk Parity — inverse-volatility weighting."""
    vols = returns_df.std().values
    inv_vol = 1.0 / np.where(vols > 0, vols, 1e-8)
    return inv_vol / inv_vol.sum()