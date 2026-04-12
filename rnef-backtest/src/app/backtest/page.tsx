'use client'

import { useState } from 'react'
import { ConfigForm } from '@/components/backtest/ConfigForm'
import { BacktestRunCard } from '@/components/backtest/BacktestRunCard'
import { runBacktest } from '@/lib/api'
import { STRATEGY_META } from '@/lib/constants'
import type { BacktestConfig, BacktestRun } from '@/types/backtest'

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  'max-sharpe':   'Mean-variance optimization with Ledoit-Wolf covariance shrinkage.',
  'hrp':          'Hierarchical Risk Parity — no matrix inversion, robust to estimation error.',
  'var-scaled':   'Position sizes inversely proportional to 95% historical VaR.',
  'equal-weight': 'Naive 1/N benchmark — equal allocation across all assets.',
  'min-vol':      'Global minimum variance — focuses on reducing portfolio volatility.',
}

export default function BacktestPage() {
  const [runs, setRuns] = useState<BacktestRun[]>([])
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (
    config: BacktestConfig,
    onProgress?: (stage: string, pct: number) => void,
  ) => {
    setError(null)
    try {
      const run = await runBacktest(config, onProgress)
      setRuns(prev => [run, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      throw err
    }
  }

  const lastRun = runs[0] ?? null

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[1fr_360px] gap-8 p-8">
      {/* Left — config form */}
      <div>
        <p className="mb-1 text-[13px] text-[#64748B]">Set parameters and select strategies to simulate</p>
        <ConfigForm onSubmit={onSubmit} />
        {error && (
          <p className="mt-3 rounded bg-red-50 px-3 py-2 text-[11px] text-red-600">{error}</p>
        )}

        {/* Results appear below form after first run */}
        {runs.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-[15px] font-bold text-[#1E293B]">Results</h2>
            <div className="space-y-3">
              {runs.map(run => (
                <BacktestRunCard key={run.id} run={run} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right — sidebar */}
      <aside className="space-y-4">
        {/* Strategy Guide */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 text-[13px] font-bold text-[#1E293B]">Strategy Guide</p>
          <div className="space-y-3">
            {Object.entries(STRATEGY_META).map(([id, meta]) => (
              <div key={id} className="flex gap-2.5">
                <span
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <div>
                  <p className="text-[12px] font-semibold text-[#1E293B]">{meta.label}</p>
                  <p className="text-[11px] text-[#64748B]">{STRATEGY_DESCRIPTIONS[id]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Run — only shown after a run */}
        {lastRun && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="mb-3 text-[13px] font-bold text-[#1E293B]">Last Run</p>
            <p className="text-[11px] text-[#94A3B8]">{lastRun.createdAt}</p>
            <p className="mt-1 text-[13px] font-semibold text-[#1E293B]">{lastRun.name}</p>
            <p className="mt-0.5 text-[11px] text-[#64748B]">
              {lastRun.strategies.length} strategies · {lastRun.rebalance} · {lastRun.txCost}bps
            </p>
            {lastRun.bestSharpe && (
              <p className="mt-2 text-[13px] font-bold text-[#2E8B57]">
                Best Sharpe: {lastRun.bestSharpe.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Data Sources */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-3 text-[13px] font-bold text-[#1E293B]">Data Sources</p>
          <ul className="space-y-1 text-[11px] text-[#64748B]">
            <li>· Price data via yfinance</li>
            <li>· Risk-free rate via FRED TB3MS</li>
            <li>· Holdings from Excel tracker</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}