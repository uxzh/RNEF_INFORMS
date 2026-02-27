import type { PerformanceRow, StrategyId } from '@/types/backtest'
import { STRATEGY_META } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PerformanceTableProps {
  rows: PerformanceRow[]
}

function pct(v: number, plus = false): string {
  const s = (v * 100).toFixed(1) + '%'
  return plus && v > 0 ? '+' + s : s
}

function StrategyDot({ id }: { id: StrategyId }) {
  const meta = STRATEGY_META[id]
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <span className="font-medium text-[#1E293B]">{meta.label}</span>
    </div>
  )
}

const COLS = ['Strategy', 'Ann. Return', 'Ann. Vol', 'Sharpe', 'Max DD', 'Calmar', 'Turnover']

export function PerformanceTable({ rows }: PerformanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            {COLS.map(c => (
              <th
                key={c}
                className={cn(
                  'py-2.5 text-[10px] font-semibold uppercase tracking-[0.6px] text-[#64748B]',
                  c === 'Strategy' ? 'text-left' : 'text-right'
                )}
                style={{ paddingRight: c !== 'Turnover' ? '16px' : undefined }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.strategy}
              className={cn(
                'border-b border-[#F1F5F9] transition-colors',
                i === rows.length - 1 && 'border-b-0',
                row.highlight === 'best' && 'bg-[#2E8B57]/5',
                row.highlight === 'rnef' && 'bg-[#002060]/5'
              )}
            >
              <td className="py-3 pr-4">
                <StrategyDot id={row.strategy} />
                {row.highlight === 'best' && (
                  <span className="ml-4 mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2E8B57]">
                    Best
                  </span>
                )}
                {row.highlight === 'rnef' && (
                  <span className="ml-4 mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[#002060]">
                    Actual
                  </span>
                )}
              </td>
              <td className={cn('py-3 pr-4 text-right tabular-nums font-semibold', row.annReturn >= 0 ? 'text-[#2E8B57]' : 'text-[#DC143C]')}>
                {pct(row.annReturn, true)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-[#64748B]">
                {pct(row.annVol)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums font-semibold text-[#1E293B]">
                {row.sharpe.toFixed(2)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-[#DC143C]">
                {pct(row.maxDD)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-[#1E293B]">
                {row.calmar.toFixed(2)}
              </td>
              <td className="py-3 text-right tabular-nums text-[#64748B]">
                {row.turnover != null ? pct(row.turnover) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
