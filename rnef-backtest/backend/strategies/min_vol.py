import numpy as np
from scipy.optimize import minimize


def optimize(mean_ret: np.ndarray, cov: np.ndarray, max_weight: float) -> np.ndarray:
    n = len(mean_ret)

    result = minimize(
        lambda w: np.sqrt(w @ cov @ w * 252),
        np.ones(n) / n,
        method="SLSQP",
        bounds=[(0, max_weight)] * n,
        constraints={"type": "eq", "fun": lambda w: np.sum(w) - 1},
    )
    return result.x if result.success else np.ones(n) / n