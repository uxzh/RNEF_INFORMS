import numpy as np
import pandas as pd
from strategies import max_sharpe, min_vol, hrp, var_scaled, equal_weight


def run_strategy(strategy_id: str, returns_df: pd.DataFrame, max_weight: float) -> np.ndarray:
    mean_ret = returns_df.mean().values
    cov = returns_df.cov().values

    if strategy_id == "max-sharpe":
        result = max_sharpe.optimize(returns_df, max_weight=max_weight)
        return result.values
    elif strategy_id == "min-vol":
        result = min_vol.optimize(returns_df, max_weight=max_weight)
        return result.values
    elif strategy_id == "hrp":
        return hrp.optimize(returns_df)
    elif strategy_id == "var-scaled":
        return var_scaled.optimize(returns_df, max_weight)
    elif strategy_id == "equal-weight":
        return equal_weight.optimize(returns_df)
    else:
        raise ValueError(f"Unknown strategy: {strategy_id}")