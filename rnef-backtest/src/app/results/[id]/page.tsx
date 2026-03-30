'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { KpiCard } from '@/components/shared/KpiCard'
import { CautionBanner } from '@/components/shared/CautionBanner'
import { EquityCurveChart } from '@/components/charts/EquityCurveChart'
import { DrawdownChart } from '@/components/charts/DrawdownChart'
import { ReturnsHeatmap } from '@/components/charts/ReturnsHeatmap'
import { PerformanceTable } from '@/components/backtest/PerformanceTable'
import { STRATEGY_META } from '@/lib/constants'
import type { BacktestRun, EquityCurvePoint, PerformanceRow, StrategyResult } from '@/types/backtest'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(v: number, plus = false): string {
  const s = (v * 100).toFixed(1) + '%'
  return plus && v > 0 ? '+' + s : s
}

function buildEquityCurve(
  results: StrategyResult[],
  benchmarkCurve?: Array<{ date: string; value: number }>,
): EquityCurvePoint[] {
  if (!results.length) return []

  const spine = results.reduce((a, b) =>
    b.equityCurve.length > a.equityCurve.length ? b : a
  ).equityCurve

  const maps = Object.fromEntries(
    results.map(r => [
      r.strategyId,
      Object.fromEntries(r.equityCurve.map(p => [p.date, p.value])),
    ])
  )

  const benchMap = benchmarkCurve
    ? Object.fromEntries(benchmarkCurve.map(p => [p.date, p.value]))
    : {}

  return spine.map(({ date }) => {
    const point: EquityCurvePoint = { date }
    for (const r of results) {
      const v = maps[r.strategyId][date]
      if (v !== undefined) point[r.strategyId] = v
    }
    if (benchmarkCurve && benchMap[date] !== undefined) {
      point['benchmark'] = benchMap[date]
    }
    return point
  })
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <Skeleton className="h-[320px] w-full rounded-lg" />
      <Skeleton className="h-[180px] w-full rounded-lg" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<BacktestRun | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [portfolioSize, setPortfolioSize] = useState(100_000)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`backtest_run_${id}`)
      if (stored) {
        setRun(JSON.parse(stored) as BacktestRun)
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    }
  }, [id])

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[14px] font-semibold text-[#1E293B]">Run not found</p>
        <p className="mt-1 text-[11px] text-[#94A3B8]">
          This run may have been completed in a different browser session.
        </p>
        <Link href="/backtest" className="mt-4 text-[11px] font-semibold text-[#002060] hover:underline">
          ← Run a new backtest
        </Link>
      </div>
    )
  }

  if (!run) return <LoadingSkeleton />

  const results = run.results ?? []
  const bestResult = results.reduce<StrategyResult | null>(
    (best, r) => (!best || r.sharpeRatio > best.sharpeRatio ? r : best),
    null
  )

  const equityCurveData = buildEquityCurve(results, run.benchmarkCurve)

  const perfRows: PerformanceRow[] = results.map(r => ({
    strategy: r.strategyId,
    annReturn: r.expectedReturn,
    annVol: r.expectedVolatility,
    sharpe: r.sharpeRatio,
    maxDD: r.maxDD,
    calmar: r.calmar,
    turnover: r.turnover,
    highlight: bestResult && r.strategyId === bestResult.strategyId ? 'best' : undefined,
  }))

  return (
    <div className="space-y-6 p-8">
      {/* Run header */}
      <div className="flex items-start justify-between rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
        <div>
          <Link
            href="/backtest"
            className="mb-1 flex items-center gap-1 text-[10px] text-[#94A3B8] hover:text-[#002060]"
          >
            <ArrowLeft size={10} /> Back to Backtest
          </Link>
          <p className="text-[15px] font-bold text-[#1E293B]">{run.name}</p>
          <p className="mt-0.5 text-[11px] text-[#64748B]">
            {run.dateRange.start} → {run.dateRange.end} · {run.rebalance} rebalance · {run.txCost}bps tx cost
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {run.strategies.map(id => (
            <span
              key={id}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: STRATEGY_META[id]?.color + '18',
                color: STRATEGY_META[id]?.color,
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: STRATEGY_META[id]?.color }}
              />
              {STRATEGY_META[id]?.label}
            </span>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <CautionBanner
        variant="info"
        message="Results are based on historical data. Past performance is not indicative of future results."
      />

      {/* KPI Row */}
      {bestResult && (
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            label="Best Sharpe Ratio"
            value={bestResult.sharpeRatio.toFixed(2)}
            sub={STRATEGY_META[bestResult.strategyId]?.label}
            accent="#2E8B57"
          />
          <KpiCard
            label="Best Ann. Return"
            value={pct(bestResult.expectedReturn, true)}
            sub={STRATEGY_META[bestResult.strategyId]?.label}
            accent="#2E8B57"
          />
          <KpiCard
            label="Max Drawdown"
            value={pct(bestResult.maxDD)}
            sub="Best strategy"
            accent="#DC143C"
          />
          <KpiCard
            label="Calmar Ratio"
            value={bestResult.calmar.toFixed(2)}
            sub="Ann. return / Max DD"
            accent="#002060"
          />
        </div>
      )}

      {/* Equity Curve */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Strategy Equity Curves"
          sub="Rebased to 100 at inception"
          className="mb-4"
        />
        {equityCurveData.length > 0 ? (
          <EquityCurveChart
            data={equityCurveData}
            strategies={run.strategies}
            benchmark={run.benchmarkCurve?.length ? { label: 'ICLN (Benchmark)' } : undefined}
          />
        ) : (
          <Skeleton className="h-[280px] w-full rounded-lg" />
        )}
      </div>

      {/* Drawdown Chart — best strategy */}
      {bestResult && bestResult.drawdown.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Drawdown"
            sub={`${STRATEGY_META[bestResult.strategyId]?.label} — percentage decline from peak`}
            className="mb-4"
          />
          <DrawdownChart data={bestResult.drawdown} />
        </div>
      )}

      {/* Performance Table */}
      {perfRows.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Strategy Summary Statistics"
            sub={`${run.rebalance} rebalancing · ${run.txCost}bps transaction cost`}
            className="mb-4"
          />
          <PerformanceTable rows={perfRows} />
        </div>
      )}

      {/* Holdings Breakdown — best strategy */}
      {bestResult && Object.keys(bestResult.weights).length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Holdings Breakdown"
            sub={`${STRATEGY_META[bestResult.strategyId]?.label} · ${Object.keys(bestResult.weights).length} positions`}
            className="mb-4"
            action={
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#94A3B8]">Portfolio size</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B]">$</span>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={portfolioSize}
                    onChange={e => setPortfolioSize(Math.max(0, Number(e.target.value)))}
                    className="h-7 w-28 rounded-md border border-[#E2E8F0] pl-5 pr-2 text-[11px] font-semibold text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#002060]"
                  />
                </div>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {['Ticker', 'Weight', 'Last Price', 'Shares', ''].map(h => (
                    <th
                      key={h}
                      className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.6px] text-[#64748B]"
                      style={{ paddingRight: '16px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(bestResult.weights)
                  .sort(([, a], [, b]) => b - a)
                  .map(([ticker, weight], i, arr) => {
                    const lastPrice = bestResult.lastPrices?.[ticker]
                    const shares = lastPrice && lastPrice > 0
                      ? Math.floor((weight * portfolioSize) / lastPrice)
                      : null
                    return (
                      <tr
                        key={ticker}
                        className={i === arr.length - 1 ? '' : 'border-b border-[#F1F5F9]'}
                      >
                        <td className="py-2.5 pr-4 font-semibold text-[#1E293B]">{ticker}</td>
                        <td className="py-2.5 pr-4 tabular-nums text-[#64748B]">
                          {(weight * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums text-[#64748B]">
                          {lastPrice != null ? `$${lastPrice.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums font-semibold text-[#1E293B]">
                          {shares != null ? shares.toLocaleString() : '—'}
                        </td>
                        <td className="py-2.5 w-full">
                          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(weight * 100).toFixed(1)}%`,
                                backgroundColor: STRATEGY_META[bestResult.strategyId]?.color ?? '#002060',
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Returns Heatmap — best strategy */}
      {bestResult && bestResult.monthlyReturns.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Monthly Returns"
            sub={`${STRATEGY_META[bestResult.strategyId]?.label} — % return per month`}
            className="mb-4"
          />
          <ReturnsHeatmap data={bestResult.monthlyReturns} />
        </div>
      )}

      <p className="text-center text-[10px] text-[#94A3B8]">Run ID: {id}</p>
    </div>
  )
}
