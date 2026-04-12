/**
 * Data fetching layer — replaces the Python yfinance backend.
 *
 * Uses yahoo-finance2 (npm) to fetch OHLCV data server-side.
 * Tickers are fetched in parallel, aligned to a common date spine,
 * and converted to daily returns for the optimization engine.
 */
import YahooFinance from 'yahoo-finance2'

// yahoo-finance2 v3 requires instantiation
const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] })

interface FetchResult {
  returns: number[][]
  dates: string[]
  lastPrices: Record<string, number>
  tickers: string[]
}

export async function fetchReturns(
  tickers: string[],
  start: string,
  end: string,
  onProgress?: (msg: string) => void
): Promise<FetchResult> {
  onProgress?.(`Downloading ${tickers.length} tickers...`)

  // fetch all tickers in parallel
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const data = await yf.historical(ticker, {
          period1: start,
          period2: end,
          interval: '1d',
        })
        return { ticker, data }
      } catch {
        return { ticker, data: [] }
      }
    })
  )

  // filter out tickers that returned no data
  const valid = results.filter(r => r.data.length > 0)
  if (valid.length === 0) throw new Error('No price data returned. Check tickers and date range.')

  // build a union of all dates (sorted ascending)
  const dateSet = new Set<string>()
  for (const { data } of valid)
    for (const row of data) {
      const d = row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10)
      dateSet.add(d)
    }
  const allDates = [...dateSet].sort()

  // for each ticker, create a date -> close map
  const closeMaps: Map<string, Map<string, number>> = new Map()
  for (const { ticker, data } of valid) {
    const m = new Map<string, number>()
    for (const row of data) {
      const d = row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10)
      const close = row.close ?? row.adjClose
      if (close != null && Number.isFinite(close)) m.set(d, close)
    }
    closeMaps.set(ticker, m)
  }

  // build price matrix aligned to date spine, forward-fill missing
  const validTickers = valid.map(v => v.ticker)
  const prices: number[][] = [] // rows = dates, cols = tickers

  for (const date of allDates) {
    const row: number[] = []
    for (const ticker of validTickers) {
      const m = closeMaps.get(ticker)!
      row.push(m.get(date) ?? NaN)
    }
    prices.push(row)
  }

  // forward-fill NaN values
  for (let c = 0; c < validTickers.length; c++) {
    for (let r = 1; r < prices.length; r++) {
      if (!Number.isFinite(prices[r][c])) prices[r][c] = prices[r - 1][c]
    }
    // back-fill if first values are NaN
    for (let r = prices.length - 2; r >= 0; r--) {
      if (!Number.isFinite(prices[r][c])) prices[r][c] = prices[r + 1][c]
    }
  }

  // compute daily returns: (price[t] / price[t-1]) - 1
  const returns: number[][] = []
  const returnDates: string[] = []
  for (let r = 1; r < prices.length; r++) {
    const row: number[] = []
    for (let c = 0; c < validTickers.length; c++) {
      const prev = prices[r - 1][c]
      const curr = prices[r][c]
      row.push(prev > 0 ? (curr / prev) - 1 : 0)
    }
    returns.push(row)
    returnDates.push(allDates[r])
  }

  // extract last prices
  const lastPrices: Record<string, number> = {}
  for (let c = 0; c < validTickers.length; c++) {
    const lastRow = prices[prices.length - 1]
    lastPrices[validTickers[c]] = Math.round(lastRow[c] * 10000) / 10000
  }

  onProgress?.('Price data ready')

  return { returns, dates: returnDates, lastPrices, tickers: validTickers }
}
