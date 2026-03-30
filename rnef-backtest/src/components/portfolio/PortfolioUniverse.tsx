'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getPortfolioTickers, savePortfolioTickers } from '@/lib/portfolio'
import { validateTickers } from '@/lib/api'

const MIN_TICKERS = 3

export function PortfolioUniverse() {
  const [tickers, setTickers] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    setTickers(getPortfolioTickers())
  }, [])

  async function addTicker() {
    const t = input.trim().toUpperCase()
    if (!t) return
    if (tickers.includes(t)) {
      setError(`${t} is already in the portfolio`)
      return
    }
    setValidating(true)
    setError('')
    const { invalid } = await validateTickers([t])
    setValidating(false)
    if (invalid.length) {
      setError(`${t} — no price data found. Check the ticker symbol.`)
      return
    }
    const next = [...tickers, t]
    setTickers(next)
    savePortfolioTickers(next)
    setInput('')
  }

  function removeTicker(t: string) {
    if (tickers.length <= MIN_TICKERS) {
      setError(`Minimum ${MIN_TICKERS} tickers required`)
      return
    }
    const next = tickers.filter(x => x !== t)
    setTickers(next)
    savePortfolioTickers(next)
    setError('')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {tickers.map(t => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#1E293B]"
          >
            {t}
            <button
              onClick={() => removeTicker(t)}
              className="ml-0.5 rounded-full text-[#94A3B8] transition-colors hover:text-[#DC143C]"
              aria-label={`Remove ${t}`}
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add ticker (e.g. ICLN)"
          value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setError('') }}
          onKeyDown={e => e.key === 'Enter' && !validating && addTicker()}
          className="max-w-[200px] text-[12px]"
          disabled={validating}
        />
        <button
          onClick={addTicker}
          disabled={validating || !input.trim()}
          className="flex h-9 items-center gap-1.5 rounded-md bg-[#002060] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#003087] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {validating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {validating ? 'Checking…' : 'Add'}
        </button>
      </div>

      {error && <p className="text-[10px] text-[#DC143C]">{error}</p>}
      <p className="text-[10px] text-[#94A3B8]">
        {tickers.length} ticker{tickers.length !== 1 ? 's' : ''} · saved automatically · used as base universe for all backtests
      </p>
    </div>
  )
}
