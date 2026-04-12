import pandas as pd
import yfinance as yf
from typing import List


def fetch_returns(tickers: List[str], start: str, end: str):
    """Returns (returns_df, last_prices) — single API call."""
    raw = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)
    if raw.empty:
        raise ValueError("No price data returned. Check tickers and date range.")

    # yfinance >=1.x always returns MultiIndex columns (Price, Ticker)
    # flatten to just ticker columns
    close = raw["Close"]
    if isinstance(close, pd.Series):
        close = close.to_frame(name=tickers[0])

    prices = close[tickers]
    last_prices = {
        t: round(float(prices[t].dropna().iloc[-1]), 4)
        for t in tickers
    }
    returns = prices.pct_change().dropna()
    return returns, last_prices