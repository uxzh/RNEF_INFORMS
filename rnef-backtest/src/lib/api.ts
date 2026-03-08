import type { BacktestConfig, BacktestRun } from '@/types/backtest'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function runBacktest(config: BacktestConfig): Promise<BacktestRun> {
  const res = await fetch(`${API_URL}/backtest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.detail ?? `Request failed (${res.status})`)
  }

  return res.json()
}