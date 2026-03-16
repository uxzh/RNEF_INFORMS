import { Skeleton } from '@/components/ui/skeleton'

export default function StocksLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4">
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[48, 52, 44, 56, 44].map((w, i) => (
              <Skeleton key={i} className="h-6 rounded-md" style={{ width: w }} />
            ))}
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>

        {/* Sector chips */}
        <div className="flex gap-1.5">
          {[72, 84, 80].map((w, i) => (
            <Skeleton key={i} className="h-6 rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* Pill badges */}
        <div className="flex flex-wrap gap-2">
          {[96, 88, 80, 100, 84, 92].map((w, i) => (
            <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
      </div>
    </div>
  )
}
