import numpy as np
from scipy.optimize import minimize


def optimize(mean_ret: np.ndarray, cov: np.ndarray, max_weight: float) -> np.ndarray:
    n = len(mean_ret)

    def neg_sharpe(w):
        r = np.dot(w, mean_ret) * 252
        v = np.sqrt(w @ cov @ w * 252)
        return -r / v if v > 0 else 0

    result = minimize(
        neg_sharpe,
        np.ones(n) / n,
        method="SLSQP",
        bounds=[(0, max_weight)] * n,
        constraints={"type": "eq", "fun": lambda w: np.sum(w) - 1},
    )
    return result.x if result.success else np.ones(n) / n