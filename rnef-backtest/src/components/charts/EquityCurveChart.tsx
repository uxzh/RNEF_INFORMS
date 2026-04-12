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

const BENCHMARK_KEY = 'benchmark'
const BENCHMARK_COLOR = '#D97706'

interface EquityCurveChartProps {
  data: EquityCurvePoint[]
  strategies: StrategyId[]
  benchmark?: { label: string }
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  benchmarkLabel?: string
}

function formatTooltipDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CustomTooltip({ active, payload, label, benchmarkLabel }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 shadow-md text-[11px]">
      <p className="mb-1.5 font-semibold text-[#64748B]">{formatTooltipDate(label ?? '')}</p>
      {payload.map(entry => {
        const displayName =
          entry.name === BENCHMARK_KEY
            ? (benchmarkLabel ?? 'Benchmark')
            : (STRATEGY_META[entry.name as StrategyId]?.label ?? entry.name)
        return (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {displayName}
            </span>
            <span className="font-semibold text-[#1E293B]">{entry.value.toFixed(1)}</span>
          </div>
        )
      })}
    </div>
  )
}

// turns "2023-04-15" into "Apr '23"
function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = String(d.getFullYear()).slice(2)
  return `${month} '${year}`
}

export function EquityCurveChart({ data, strategies, benchmark }: EquityCurveChartProps) {
  // show ~8 evenly spaced ticks so labels don't overlap
  const tickInterval = data.length > 8 ? Math.floor(data.length / 8) : 0

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatDate}
          interval={tickInterval}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip benchmarkLabel={benchmark?.label} />} />
        <Legend
          wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }}
          formatter={(value: string) => (
            <span style={{ color: '#64748B' }}>
              {value === BENCHMARK_KEY
                ? (benchmark?.label ?? 'Benchmark')
                : (STRATEGY_META[value as StrategyId]?.label ?? value)}
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
        {benchmark && (
          <Line
            key={BENCHMARK_KEY}
            type="monotone"
            dataKey={BENCHMARK_KEY}
            stroke={BENCHMARK_COLOR}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
