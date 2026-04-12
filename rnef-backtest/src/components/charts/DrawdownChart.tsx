'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DrawdownPoint {
  date: string
  drawdown: number  // negative value, e.g. -0.152
}

interface DrawdownChartProps {
  data: DrawdownPoint[]
}

// Mock drawdown data derived from equity curve
export const MOCK_DRAWDOWN_DATA: DrawdownPoint[] = [
  { date: 'Oct 22', drawdown: 0 },
  { date: 'Jan 23', drawdown: -0.032 },
  { date: 'Apr 23', drawdown: -0.018 },
  { date: 'Jul 23', drawdown: -0.005 },
  { date: 'Oct 23', drawdown: -0.152 },
  { date: 'Jan 24', drawdown: -0.098 },
  { date: 'Apr 24', drawdown: -0.071 },
  { date: 'Jul 24', drawdown: -0.040 },
  { date: 'Oct 24', drawdown: -0.065 },
  { date: 'Jan 25', drawdown: -0.088 },
  { date: 'Feb 26', drawdown: -0.110 },
]

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 shadow-md text-[11px]">
      <p className="font-semibold text-[#64748B]">{label}</p>
      <p className="mt-0.5 font-semibold text-[#DC143C]">{(val * 100).toFixed(1)}%</p>
    </div>
  )
}

// turns "2023-04-15" into "Apr '23"
function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = String(d.getFullYear()).slice(2)
  return `${month} '${year}`
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const tickInterval = data.length > 8 ? Math.floor(data.length / 8) : 0

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#DC143C" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#DC143C" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={formatDate} interval={tickInterval} />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          domain={['auto', 0]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#DC143C"
          strokeWidth={1.5}
          fill="url(#ddGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
