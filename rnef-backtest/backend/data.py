import pandas as pd
import yfinance as yf
from typing import List


def fetch_returns(tickers: List[str], start: str, end: str):
    """Returns (returns_df, last_prices) — single API call."""
    raw = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)["Close"]
    if raw.empty:
        raise ValueError("No price data returned. Check tickers and date range.")
    prices = raw[tickers] if len(tickers) > 1 else raw
    last_prices = {
        t: round(float(prices[t].dropna().iloc[-1]) if len(tickers) > 1 else float(prices.dropna().iloc[-1]), 4)
        for t in tickers
    }
    returns = prices.pct_change().dropna()
    return returns, last_prices