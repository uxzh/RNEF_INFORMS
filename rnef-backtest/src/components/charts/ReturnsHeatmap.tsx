import { cn } from '@/lib/utils'

interface MonthlyReturn {
  year: number
  month: number  // 1–12
  value: number  // decimal
}

interface ReturnsHeatmapProps {
  data: MonthlyReturn[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock monthly return data
export const MOCK_MONTHLY_RETURNS: MonthlyReturn[] = [
  // 2023
  { year: 2023, month: 1,  value:  0.042 },
  { year: 2023, month: 2,  value: -0.018 },
  { year: 2023, month: 3,  value:  0.031 },
  { year: 2023, month: 4,  value:  0.019 },
  { year: 2023, month: 5,  value: -0.025 },
  { year: 2023, month: 6,  value:  0.058 },
  { year: 2023, month: 7,  value:  0.027 },
  { year: 2023, month: 8,  value: -0.041 },
  { year: 2023, month: 9,  value: -0.063 },
  { year: 2023, month: 10, value: -0.082 },
  { year: 2023, month: 11, value:  0.094 },
  { year: 2023, month: 12, value:  0.021 },
  // 2024
  { year: 2024, month: 1,  value:  0.033 },
  { year: 2024, month: 2,  value:  0.017 },
  { year: 2024, month: 3,  value:  0.045 },
  { year: 2024, month: 4,  value: -0.022 },
  { year: 2024, month: 5,  value:  0.038 },
  { year: 2024, month: 6,  value:  0.012 },
  { year: 2024, month: 7,  value:  0.029 },
  { year: 2024, month: 8,  value: -0.009 },
  { year: 2024, month: 9,  value:  0.061 },
  { year: 2024, month: 10, value: -0.034 },
  { year: 2024, month: 11, value:  0.053 },
  { year: 2024, month: 12, value:  0.028 },
  // 2025
  { year: 2025, month: 1,  value: -0.047 },
  { year: 2025, month: 2,  value:  0.015 },
]

function getColor(value: number): string {
  if (value >= 0.06)  return 'bg-[#2E8B57] text-white'
  if (value >= 0.03)  return 'bg-[#2E8B57]/50 text-[#166534]'
  if (value > 0)      return 'bg-[#2E8B57]/20 text-[#166534]'
  if (value >= -0.03) return 'bg-[#DC143C]/20 text-[#991B1B]'
  if (value >= -0.06) return 'bg-[#DC143C]/50 text-[#991B1B]'
  return 'bg-[#DC143C] text-white'
}

export function ReturnsHeatmap({ data }: ReturnsHeatmapProps) {
  const years = [...new Set(data.map(d => d.year))].sort()

  const getReturn = (year: number, month: number) =>
    data.find(d => d.year === year && d.month === month)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0.5 text-[10px]">
        <thead>
          <tr>
            <th className="w-12 pb-1 text-left font-semibold text-[#64748B]">Year</th>
            {MONTHS.map(m => (
              <th key={m} className="pb-1 text-center font-semibold text-[#64748B]">{m}</th>
            ))}
            <th className="pb-1 text-center font-semibold text-[#64748B]">YTD</th>
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const ytd = data
              .filter(d => d.year === year)
              .reduce((acc, d) => acc * (1 + d.value), 1) - 1

            return (
              <tr key={year}>
                <td className="pr-2 font-semibold text-[#1E293B]">{year}</td>
                {MONTHS.map((_, i) => {
                  const entry = getReturn(year, i + 1)
                  if (!entry) {
                    return (
                      <td key={i} className="h-7 rounded bg-[#F1F5F9] text-center text-[#94A3B8]">–</td>
                    )
                  }
                  return (
                    <td
                      key={i}
                      className={cn('h-7 rounded text-center font-semibold tabular-nums', getColor(entry.value))}
                    >
                      {(entry.value * 100).toFixed(1)}
                    </td>
                  )
                })}
                <td className={cn('h-7 rounded text-center font-semibold tabular-nums', getColor(ytd))}>
                  {(ytd * 100).toFixed(1)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
