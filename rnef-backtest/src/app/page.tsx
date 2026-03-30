'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from '@/components/shared/KpiCard'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { HoldingsTable } from '@/components/holdings/HoldingsTable'
import { PortfolioUniverse } from '@/components/portfolio/PortfolioUniverse'
import { BacktestRunCard } from '@/components/backtest/BacktestRunCard'
import { MOCK_HOLDINGS, MOCK_PORTFOLIO_SUMMARY } from '@/lib/mock-data'
import { NAV_COLORS } from '@/lib/constants'
import type { BacktestRun } from '@/types/backtest'

function fmtNav(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(decimals)}%`
}

function loadRecentRuns(): BacktestRun[] {
  try {
    const ids = JSON.parse(localStorage.getItem('backtest_run_ids') ?? '[]') as string[]
    return ids.slice(0, 3).flatMap(id => {
      try {
        const raw = localStorage.getItem(`backtest_run_${id}`)
        return raw ? [JSON.parse(raw) as BacktestRun] : []
      } catch { return [] }
    })
  } catch { return [] }
}

export default function DashboardPage() {
  const summary = MOCK_PORTFOLIO_SUMMARY
  const holdings = MOCK_HOLDINGS

  const [recentRuns, setRecentRuns] = useState<BacktestRun[] | null>(null)

  useEffect(() => {
    setRecentRuns(loadRecentRuns())
  }, [])

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Portfolio NAV"
          value={`$${fmtNav(summary.nav)}`}
          sub="As of Feb 22, 2026"
          accent={NAV_COLORS.navy}
        />
        <KpiCard
          label="Total Return vs ICLN"
          value={fmtPct(summary.vsIcln)}
          sub={`Total return: ${fmtPct(summary.totalReturn)}`}
          accent={summary.vsIcln >= 0 ? NAV_COLORS.green : NAV_COLORS.red}
        />
        <KpiCard
          label="Sharpe Ratio"
          value={summary.sharpe.toFixed(2)}
          sub="Since inception"
          accent={NAV_COLORS.blue}
        />
        <KpiCard
          label="Max Drawdown"
          value={fmtPct(summary.maxDrawdown)}
          sub="Since inception"
          accent={NAV_COLORS.amber}
        />
      </div>

      {/* Portfolio Universe */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Portfolio Universe"
          sub="These tickers form the base universe for all backtests. Add or remove to customise."
          className="mb-4"
        />
        <PortfolioUniverse />
      </div>

      {/* Holdings Table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Current Holdings"
          sub={`${holdings.length} active positions`}
          className="mb-4"
        />
        <HoldingsTable holdings={holdings} />
      </div>

      {/* Recent Backtests */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle
            title="Recent Backtests"
            sub={
              recentRuns === null
                ? 'Loading…'
                : recentRuns.length === 0
                ? 'No backtests run yet'
                : `${recentRuns.length} recent run${recentRuns.length !== 1 ? 's' : ''}`
            }
          />
          <Link href="/backtest">
            <Button size="sm" className="h-8 bg-[#002060] text-[11px] text-white hover:bg-[#003087]">
              <Plus size={12} className="mr-1.5" />
              New Backtest
            </Button>
          </Link>
        </div>

        {recentRuns === null && (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        )}

        {recentRuns?.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-white py-10 text-center">
            <p className="text-[12px] text-[#94A3B8]">
              Run a backtest to see results here.
            </p>
          </div>
        )}

        {recentRuns && recentRuns.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {recentRuns.map(run => (
              <BacktestRunCard key={run.id} run={run} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
