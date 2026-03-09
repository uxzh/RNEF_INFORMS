import numpy as np
import pandas as pd


def apply_tx_cost(weights_before: np.ndarray, weights_after: np.ndarray, tx_cost_bps: int) -> float:
    turnover = np.sum(np.abs(weights_after - weights_before))
    return turnover * (tx_cost_bps / 10_000)


def compute_metrics(weights: np.ndarray, returns_df: pd.DataFrame, tx_cost_bps: int):
    mean_ret = returns_df.mean().values
    cov = returns_df.cov().values
    equal = np.ones(len(weights)) / len(weights)

    port_return = float(np.dot(weights, mean_ret) * 252)
    port_vol = float(np.sqrt(weights @ cov @ weights * 252))
    sharpe = port_return / port_vol if port_vol > 0 else 0.0

    cost = apply_tx_cost(equal, weights, tx_cost_bps)
    port_return_net = port_return - cost * 252

    return round(port_return_net, 4), round(port_vol, 4), round(sharpe, 4)