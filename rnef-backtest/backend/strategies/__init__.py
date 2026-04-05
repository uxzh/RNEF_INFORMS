import numpy as np
import pandas as pd
from strategies import max_sharpe, min_vol, hrp, var_scaled, equal_weight


def run_strategy(strategy_id: str, returns_df: pd.DataFrame, max_weight: float) -> np.ndarray:
    if strategy_id == "max-sharpe":
        result = max_sharpe.optimize(returns_df, max_weight=max_weight)
        return result.values
    elif strategy_id == "min-vol":
        result = min_vol.optimize(returns_df, max_weight=max_weight)
        return result.values
    elif strategy_id == "hrp":
        return hrp.optimize(returns_df)
    elif strategy_id == "var-scaled":
        result = var_scaled.optimize(returns_df, max_weight)
        return result.values if isinstance(result, pd.Series) else result
    elif strategy_id == "equal-weight":
        result = equal_weight.optimize(returns_df)
        return result.values if isinstance(result, pd.Series) else result
    else:
        raise ValueError(f"Unknown strategy: {strategy_id}")