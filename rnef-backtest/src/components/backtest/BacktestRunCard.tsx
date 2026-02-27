import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { BacktestRun, BacktestStatus } from '@/types/backtest'
import { STRATEGY_META } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface BacktestRunCardProps {
  run: BacktestRun
}

function StatusIcon({ status }: { status: BacktestStatus }) {
  if (status === 'complete') return <CheckCircle2 size={13} className="text-[#2E8B57]" />
  if (status === 'running')  return <Clock size={13} className="text-[#D97706] animate-pulse" />
  return <XCircle size={13} className="text-[#DC143C]" />
}

function StatusLabel({ status }: { status: BacktestStatus }) {
  const map = {
    complete: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    running:  'bg-[#D97706]/10 text-[#D97706]',
    failed:   'bg-[#DC143C]/10 text-[#DC143C]',
  }
  return (
    <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold capitalize', map[status])}>
      {status}
    </span>
  )
}

export function BacktestRunCard({ run }: BacktestRunCardProps) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold text-[#1E293B]">{run.name}</p>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">{run.createdAt}</p>
        </div>
        <StatusLabel status={run.status} />
      </div>

      {/* Date range */}
      <p className="mt-2.5 text-[11px] text-[#64748B]">
        {run.dateRange.start} → {run.dateRange.end}
      </p>

      {/* Strategy dots */}
      <div className="mt-3 flex flex-wrap gap-1">
        {run.strategies.map(id => (
          <span
            key={id}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: STRATEGY_META[id].color + '15',
              color: STRATEGY_META[id].color,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: STRATEGY_META[id].color }}
            />
            {STRATEGY_META[id].label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
        <div className="text-[11px] text-[#64748B]">
          {run.txCost}bps · {run.rebalance}
          {run.bestSharpe && (
            <span className="ml-2 font-semibold text-[#2E8B57]">
              Best Sharpe: {run.bestSharpe.toFixed(2)}
            </span>
          )}
        </div>
        {run.status === 'complete' && (
          <Link
            href={`/results/${run.id}`}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#002060] hover:underline"
          >
            View <ArrowRight size={11} />
          </Link>
        )}
        {run.status === 'running' && (
          <div className="flex items-center gap-1 text-[11px] text-[#D97706]">
            <StatusIcon status="running" />
            Processing…
          </div>
        )}
      </div>
    </div>
  )
}
