'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { EquityCurvePoint, StrategyId } from '@/types/backtest'
import { STRATEGY_META } from '@/lib/constants'

interface EquityCurveChartProps {
  data: EquityCurvePoint[]
  strategies: StrategyId[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 shadow-md text-[11px]">
      <p className="mb-1.5 font-semibold text-[#64748B]">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {STRATEGY_META[entry.name as StrategyId]?.label ?? entry.name}
          </span>
          <span className="font-semibold text-[#1E293B]">{entry.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export function EquityCurveChart({ data, strategies }: EquityCurveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }}
          formatter={(value: string) => (
            <span style={{ color: '#64748B' }}>
              {STRATEGY_META[value as StrategyId]?.label ?? value}
            </span>
          )}
        />
        {strategies.map(id => {
          const meta = STRATEGY_META[id]
          return (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={meta.color}
              strokeWidth={id === 'rnef-actual' ? 2.5 : 1.5}
              strokeDasharray={meta.dashed ? '5 3' : undefined}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}
