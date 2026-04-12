import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] })

export async function POST(req: NextRequest) {
  try {
    const { tickers, start, end } = await req.json()
    const endDate = end || new Date().toISOString().slice(0, 10)
    const startDate = start || new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)

    const checks = await Promise.all(
      (tickers as string[]).map(async (ticker: string) => {
        try {
          const data = await yf.historical(ticker, {
            period1: startDate,
            period2: endDate,
            interval: '1d' as const,
          })
          return { ticker, valid: Array.isArray(data) && data.length > 0 }
        } catch {
          return { ticker, valid: false }
        }
      })
    )

    const valid = checks.filter(c => c.valid).map(c => c.ticker)
    const invalid = checks.filter(c => !c.valid).map(c => c.ticker)
    return NextResponse.json({ valid, invalid })
  } catch {
    return NextResponse.json({ valid: [], invalid: [] })
  }
}
