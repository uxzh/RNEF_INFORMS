import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { SavedStrategy } from '@/types/backtest'
import { STRATEGY_META } from '@/lib/constants'
import { StatusBadge } from '@/components/shared/StatusBadge'

interface StrategyCardProps {
  strategy: SavedStrategy
  href?: string
}

export function StrategyCard({ strategy, href }: StrategyCardProps) {
  const meta = STRATEGY_META[strategy.type]

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          <p className="text-[12.5px] font-semibold text-[#1E293B]">{strategy.name}</p>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-[#64748B]">{strategy.description}</p>

      {/* Metrics */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Sharpe</p>
          <p className="mt-0.5 text-[14px] font-bold text-[#1E293B]">{strategy.sharpe.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Ann. Return</p>
          <div className="mt-0.5">
            <StatusBadge value={strategy.annReturn} size="md" />
          </div>
        </div>
      </div>

      {/* Tags + Last Run + View link */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-3">
        <div className="flex flex-wrap gap-1">
          {strategy.tags.map(tag => (
            <span
              key={tag}
              className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-medium text-[#64748B]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-[#94A3B8]">{strategy.lastRun}</p>
          {href && (
            <Link
              href={href}
              className="flex items-center gap-0.5 text-[10px] font-semibold text-[#002060] hover:underline"
            >
              View <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
