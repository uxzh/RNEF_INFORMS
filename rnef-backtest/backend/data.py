import pandas as pd
import yfinance as yf
from typing import List


def fetch_returns(tickers: List[str], start: str, end: str) -> pd.DataFrame:
    data = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)["Close"]
    if data.empty:
        raise ValueError("No price data returned. Check tickers and date range.")
    data = data[tickers] if len(tickers) > 1 else data
    return data.pct_change().dropna()