import { Skeleton } from '@/components/ui/skeleton'
import { SectionTitle } from '@/components/shared/SectionTitle'

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

function KpiSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-[#E2E8F0]" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2.5 h-8 w-28" />
      <Skeleton className="mt-1.5 h-2.5 w-20" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#F1F5F9]">
      <td className="py-3 pr-4"><Skeleton className="h-3 w-32" /></td>
      <td className="py-3 pr-4 text-right"><Skeleton className="ml-auto h-3 w-14" /></td>
      <td className="py-3 pr-4 text-right"><Skeleton className="ml-auto h-3 w-14" /></td>
      <td className="py-3 pr-4 text-right"><Skeleton className="ml-auto h-3 w-10" /></td>
      <td className="py-3 pr-4 text-right"><Skeleton className="ml-auto h-3 w-14" /></td>
      <td className="py-3 pr-4 text-right"><Skeleton className="ml-auto h-3 w-10" /></td>
      <td className="py-3 text-right">     <Skeleton className="ml-auto h-3 w-14" /></td>
    </tr>
  )
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      {/* Run header skeleton */}
      <div className="flex items-start justify-between rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
      </div>

      {/* Info banner skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
      </div>

      {/* Equity Curve */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Strategy Equity Curves"
          sub="Rebased to 100 at inception"
          className="mb-4"
        />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>

      {/* Drawdown Chart */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Drawdown"
          sub="Percentage decline from peak"
          className="mb-4"
        />
        <Skeleton className="h-[140px] w-full rounded-lg" />
      </div>

      {/* Performance Table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Strategy Summary Statistics"
          sub="Walk-forward backtest results"
          className="mb-4"
        />
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {['Strategy', 'Ann. Return', 'Ann. Vol', 'Sharpe', 'Max DD', 'Calmar', 'Turnover'].map(h => (
                <th
                  key={h}
                  className="py-2.5 text-[10px] font-semibold uppercase tracking-[0.6px] text-[#64748B]"
                  style={{ textAlign: h === 'Strategy' ? 'left' : 'right', paddingRight: '16px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
          </tbody>
        </table>
      </div>

      {/* Monthly Returns Heatmap */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <SectionTitle
          title="Monthly Returns"
          sub="% return per month"
          className="mb-4"
        />
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-1.5">
              <Skeleton className="h-7 w-10 shrink-0 rounded" />
              {Array.from({ length: 13 }).map((_, j) => (
                <Skeleton key={j} className="h-7 flex-1 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[10px] text-[#94A3B8]">Run ID: {id}</p>
    </div>
  )
}
