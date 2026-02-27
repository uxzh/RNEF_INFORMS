import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from '@/components/shared/KpiCard'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { HoldingsTable } from '@/components/holdings/HoldingsTable'
import { readHoldings, readPortfolioSummary } from '@/lib/excel'
import { NAV_COLORS } from '@/lib/constants'

function fmtNav(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(decimals)}%`
}

function BacktestRunSkeleton() {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <Skeleton className="h-2.5 w-52" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
        <Skeleton className="h-2.5 w-36" />
        <Skeleton className="h-2.5 w-10" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const holdings = readHoldings()
  const summary = readPortfolioSummary()

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

      {/* Holdings Table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Current Holdings"
          sub={`${holdings.length} active positions · Excel data`}
          className="mb-4"
          action={
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-[#64748B]">
              Upload New Excel
            </Button>
          }
        />
        <HoldingsTable holdings={holdings} />
      </div>

      {/* Recent Backtests */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle
            title="Recent Backtests"
            sub="No backtests run yet"
          />
          <Link href="/backtest">
            <Button size="sm" className="h-8 bg-[#002060] text-[11px] text-white hover:bg-[#003087]">
              <Plus size={12} className="mr-1.5" />
              New Backtest
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <BacktestRunSkeleton />
          <BacktestRunSkeleton />
          <BacktestRunSkeleton />
        </div>
      </div>
    </div>
  )
}
