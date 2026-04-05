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


def _risk_scale(cov: np.ndarray) -> float:
    try:
        scale = float(np.linalg.eigvalsh(cov).max())
    except np.linalg.LinAlgError:
        scale = float(np.max(np.diag(cov)))

    return max(scale, 1e-8)


def _annual_sharpe(weights: np.ndarray, mean_returns: np.ndarray, cov: np.ndarray, risk_free_rate: float) -> float:
    ann_return = float(weights @ mean_returns) * 252.0
    ann_vol = float(np.sqrt(max(weights @ cov @ weights, 0.0) * 252.0))

    if ann_vol <= 0:
        return float("-inf")

    return (ann_return - risk_free_rate) / ann_vol


def _utility_solve(
    mean_returns: np.ndarray,
    cov: np.ndarray,
    max_weight: float,
    gamma: float,
    start: np.ndarray,
) -> np.ndarray:
    weights = start.copy()
    step = 1.0 / max(gamma * _risk_scale(cov), 1e-8)

    for _ in range(1500):
        gradient = mean_returns - gamma * (cov @ weights)
        next_weights = _project(weights + step * gradient, max_weight)

        if np.linalg.norm(next_weights - weights, ord=1) < 1e-10:
            weights = next_weights
            break

        weights = next_weights

    return weights


def optimize(returns_df: pd.DataFrame, **kwargs) -> pd.Series:
    """
    Max sharpe long only with capped weights
    Returns a pandas Series with tickers as index
    """
    returns_df = _clean_returns(returns_df)
    n_assets = len(returns_df.columns)

    if n_assets == 1 or len(returns_df) < 2:
        return pd.Series([1.0], index=returns_df.columns)

    max_weight = _cap(n_assets, kwargs)
    risk_free_rate = float(kwargs.get("risk_free_rate", 0.0) or 0.0)
    mean_returns = returns_df.mean().to_numpy(dtype=float)
    cov = _regularized_cov(returns_df)

    weights = _project(np.full(n_assets, 1.0 / n_assets), max_weight)
    best_weights = weights.copy()
    best_score = _annual_sharpe(best_weights, mean_returns, cov, risk_free_rate)

    # try direct tangency first
    try:
        tangency = np.linalg.solve(cov, mean_returns)
        tangency = np.nan_to_num(tangency, nan=0.0, posinf=0.0, neginf=0.0)
        tangency = _project(tangency, max_weight)
        tangency_score = _annual_sharpe(tangency, mean_returns, cov, risk_free_rate)
        if tangency_score > best_score:
            best_weights = tangency
            best_score = tangency_score
            weights = tangency
    except np.linalg.LinAlgError:
        pass

    # sweep risk aversion and keep the best sharpe point
    for gamma in np.logspace(-2, 4, 48):
        weights = _utility_solve(mean_returns, cov, max_weight, float(gamma), weights)
        score = _annual_sharpe(weights, mean_returns, cov, risk_free_rate)

        if score > best_score:
            best_weights = weights.copy()
            best_score = score

    return pd.Series(best_weights, index=returns_df.columns)