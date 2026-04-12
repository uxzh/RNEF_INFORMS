import type { BacktestConfig, BacktestRun } from '@/types/backtest'

export async function validateTickers(
  tickers: string[],
  start?: string,
  end?: string,
): Promise<{ valid: string[]; invalid: string[] }> {
  try {
    const res = await fetch('/api/validate', {
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

// reads an SSE stream from /api/backtest, reports progress, resolves with the final result
export async function runBacktest(
  config: BacktestConfig,
  onProgress?: (stage: string, pct: number) => void,
): Promise<BacktestRun> {
  const res = await fetch('/api/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.detail ?? `Request failed (${res.status})`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response stream')

  const decoder = new TextDecoder()
  let buffer = ''
  let run: BacktestRun | null = null
  let errorMsg = ''
  // keep event type across chunks so split events still work
  let currentEvent = ''

  // parse SSE events from the stream
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        const raw = line.slice(6)
        try {
          const parsed = JSON.parse(raw)
          if (currentEvent === 'progress' && onProgress) {
            onProgress(parsed.stage, parsed.pct)
          } else if (currentEvent === 'result') {
            run = parsed as BacktestRun
          } else if (currentEvent === 'error') {
            errorMsg = parsed.detail || 'Backtest failed'
          }
        } catch { /* skip malformed JSON */ }
        currentEvent = ''
      }
    }
  }

  if (errorMsg) throw new Error(errorMsg)
  if (!run) throw new Error('No result received from backtest')

  // persist to localStorage
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
