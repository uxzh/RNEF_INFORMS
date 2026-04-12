import type { BacktestConfig, BacktestRun } from '@/types/backtest'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function validateTickers(
  tickers: string[],
  start?: string,
  end?: string,
): Promise<{ valid: string[]; invalid: string[] }> {
  try {
    const res = await fetch(`${API_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers, start, end }),
    })
    if (!res.ok) return { valid: [], invalid: tickers }
    return res.json()
  } catch {
    return { valid: [], invalid: tickers }
  }
}

export async function runBacktest(config: BacktestConfig): Promise<BacktestRun> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
  } catch {
    throw new Error(
      'Could not reach the backend server. Make sure it is running on ' + API_URL
    )
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.detail ?? `Request failed (${res.status})`)
  }

  const run: BacktestRun = await res.json()

  try {
    localStorage.setItem(`backtest_run_${run.id}`, JSON.stringify(run))
    const ids = JSON.parse(localStorage.getItem('backtest_run_ids') ?? '[]') as string[]
    if (!ids.includes(run.id)) {
      localStorage.setItem('backtest_run_ids', JSON.stringify([run.id, ...ids]))
    }
  } catch {
    // localStorage full or unavailable
  }

  return run
}