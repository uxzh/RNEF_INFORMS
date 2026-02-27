import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  accent?: string  // hex color for left stripe
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KpiCard({ label, value, sub, accent = '#002060', className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm',
        className
      )}
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
        style={{ backgroundColor: accent }}
      />

      <p className="text-[10.5px] font-semibold uppercase tracking-[0.6px] text-[#64748B]">
        {label}
      </p>
      <p className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-[#1E293B]">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[11px] text-[#64748B]">{sub}</p>
      )}
    </div>
  )
}
