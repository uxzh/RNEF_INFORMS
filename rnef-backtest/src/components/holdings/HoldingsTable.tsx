import type { Holding } from '@/types/holdings'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'

interface HoldingsTableProps {
  holdings: Holding[]
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function WeightBar({ weight }: { weight: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-[#F1F5F9]">
        <div
          className="h-full rounded-full bg-[#002060]"
          style={{ width: `${Math.min(weight * 100 * 4, 100)}%` }}
        />
      </div>
      <span className="tabular-nums text-[11px] text-[#1E293B]">{(weight * 100).toFixed(1)}%</span>
    </div>
  )
}

const STOP_LOSS_WARN_THRESHOLD = 0.05  // within 5% of stop loss

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            {['Ticker', 'Weight', 'Entry', 'Current', 'Return', 'Days', 'Stop Loss', 'R/R', 'IRR'].map(h => (
              <th
                key={h}
                className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.6px] text-[#64748B] first:pl-0 last:text-right"
                style={{ paddingRight: '12px' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => {
            const nearStop = h.currentPrice > 0 &&
              (h.currentPrice - h.stopLoss) / h.currentPrice < STOP_LOSS_WARN_THRESHOLD

            return (
              <tr
                key={h.ticker}
                className={cn(
                  'border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC]',
                  i === holdings.length - 1 && 'border-b-0'
                )}
              >
                {/* Ticker */}
                <td className="py-3 pr-3">
                  <div className="font-semibold text-[#1E293B]">{h.ticker}</div>
                  <div className="text-[10px] text-[#94A3B8]">{h.company}</div>
                </td>

                {/* Weight */}
                <td className="py-3 pr-4">
                  <WeightBar weight={h.weight} />
                </td>

                {/* Entry */}
                <td className="py-3 pr-4 tabular-nums text-[#64748B]">
                  ${fmt(h.entryPrice)}
                </td>

                {/* Current */}
                <td className="py-3 pr-4 tabular-nums font-medium text-[#1E293B]">
                  ${fmt(h.currentPrice)}
                </td>

                {/* Total Return */}
                <td className="py-3 pr-4">
                  <StatusBadge value={h.totalReturn} />
                </td>

                {/* Days Held */}
                <td className="py-3 pr-4 tabular-nums text-[#64748B]">
                  {h.daysHeld}d
                </td>

                {/* Stop Loss */}
                <td className="py-3 pr-4">
                  <span className={cn('tabular-nums', nearStop ? 'font-semibold text-[#D97706]' : 'text-[#64748B]')}>
                    ${fmt(h.stopLoss)}
                  </span>
                  {nearStop && (
                    <span className="ml-1 text-[9px] font-bold text-[#D97706]">!</span>
                  )}
                </td>

                {/* R/R */}
                <td className="py-3 pr-4 tabular-nums">
                  <span className={cn('font-medium', h.rrRatio >= 2 ? 'text-[#2E8B57]' : h.rrRatio < 1 ? 'text-[#DC143C]' : 'text-[#1E293B]')}>
                    {h.rrRatio.toFixed(1)}x
                  </span>
                </td>

                {/* IRR */}
                <td className="py-3 text-right">
                  <StatusBadge value={h.irr} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
