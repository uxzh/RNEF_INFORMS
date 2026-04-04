import numpy as np
import pandas as pd


def _clean_returns(returns_df: pd.DataFrame) -> pd.DataFrame:
    if isinstance(returns_df, pd.Series):
        returns_df = returns_df.to_frame()
    elif not isinstance(returns_df, pd.DataFrame):
        returns_df = pd.DataFrame(returns_df)

    returns_df = returns_df.apply(pd.to_numeric, errors="coerce")
    returns_df = returns_df.replace([np.inf, -np.inf], np.nan)
    returns_df = returns_df.dropna(axis=1, how="all")
    returns_df = returns_df.dropna(axis=0, how="all")
    returns_df = returns_df.dropna(axis=0, how="any")

    if returns_df.empty or len(returns_df.columns) == 0:
        raise ValueError("returns_df must contain numeric return data")

    return returns_df


def _cap(n_assets: int, kwargs: dict) -> float:
    max_weight = kwargs.get("max_weight", 1.0)
    try:
        max_weight = float(max_weight)
    except (TypeError, ValueError):
        max_weight = 1.0

    if not np.isfinite(max_weight):
        max_weight = 1.0

    return min(max(max_weight, 1.0 / n_assets), 1.0)


def _project(weights: np.ndarray, max_weight: float) -> np.ndarray:
    lo = float(np.min(weights) - max_weight)
    hi = float(np.max(weights))

    for _ in range(80):
        mid = 0.5 * (lo + hi)
        clipped = np.clip(weights - mid, 0.0, max_weight)
        if clipped.sum() > 1.0:
            lo = mid
        else:
            hi = mid

    projected = np.clip(weights - hi, 0.0, max_weight)
    total = projected.sum()

    if total <= 0:
        return np.full(len(weights), 1.0 / len(weights))

    return projected / total


def _regularized_cov(returns_df: pd.DataFrame) -> np.ndarray:
    cov = returns_df.cov().to_numpy(dtype=float)
    cov = np.nan_to_num(cov, nan=0.0, posinf=0.0, neginf=0.0)
    cov = 0.5 * (cov + cov.T)

    diag = np.diag(cov)
    scale = float(np.mean(diag)) if len(diag) and np.isfinite(diag).any() else 1.0
    ridge = max(scale, 1e-8) * 1e-6

    return cov + np.eye(len(cov)) * ridge


def _step_size(cov: np.ndarray) -> float:
    try:
        scale = float(np.linalg.eigvalsh(cov).max())
    except np.linalg.LinAlgError:
        scale = float(np.max(np.diag(cov)))

    return 1.0 / max(scale, 1e-8)


def optimize(returns_df: pd.DataFrame, **kwargs) -> pd.Series:
    """
    Min volatility long only with capped weights
    Returns a pandas Series with tickers as index
    """
    returns_df = _clean_returns(returns_df)
    n_assets = len(returns_df.columns)

    if n_assets == 1 or len(returns_df) < 2:
        return pd.Series([1.0], index=returns_df.columns)

    max_weight = _cap(n_assets, kwargs)
    cov = _regularized_cov(returns_df)
    step = _step_size(cov)
    weights = _project(np.full(n_assets, 1.0 / n_assets), max_weight)

    # solve
    for _ in range(4000):
        gradient = cov @ weights
        next_weights = _project(weights - step * gradient, max_weight)

        if np.linalg.norm(next_weights - weights, ord=1) < 1e-10:
            weights = next_weights
            break

        weights = next_weights

    return pd.Series(weights, index=returns_df.columns)
