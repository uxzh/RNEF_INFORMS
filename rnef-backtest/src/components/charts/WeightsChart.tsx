'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WeightsChartProps {
  weights: Record<string, number>
  color?: string
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 shadow-md text-[11px]">
      <p className="font-semibold text-[#1E293B]">{label}</p>
      <p className="mt-0.5 text-[#64748B]">{(payload[0].value).toFixed(1)}%</p>
    </div>
  )
}

export function WeightsChart({ weights, color = '#002060' }: WeightsChartProps) {
  const data = Object.entries(weights)
    .map(([ticker, w]) => ({ ticker, weight: parseFloat((w * 100).toFixed(1)) }))
    .sort((a, b) => b.weight - a.weight)

  const chartHeight = Math.max(180, data.length * 36)

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 48, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}%`}
          domain={[0, 'dataMax + 2']}
        />
        <YAxis
          type="category"
          dataKey="ticker"
          tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
        <Bar dataKey="weight" radius={[0, 4, 4, 0]} fill={color} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
