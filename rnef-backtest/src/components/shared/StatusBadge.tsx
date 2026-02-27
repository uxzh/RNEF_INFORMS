import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  value: number      // decimal, e.g. 0.031 or -0.152
  format?: 'percent' | 'decimal'
  size?: 'sm' | 'md'
}

export function StatusBadge({ value, format = 'percent', size = 'sm' }: StatusBadgeProps) {
  const isPositive = value > 0
  const isNegative = value < 0

  const display = format === 'percent'
    ? `${isPositive ? '+' : ''}${(value * 100).toFixed(2)}%`
    : `${isPositive ? '+' : ''}${value.toFixed(2)}`

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 font-semibold tabular-nums',
        size === 'sm' ? 'text-[11px]' : 'text-[12.5px]',
        isPositive && 'bg-[#2E8B57]/10 text-[#2E8B57]',
        isNegative && 'bg-[#DC143C]/10 text-[#DC143C]',
        !isPositive && !isNegative && 'bg-[#64748B]/10 text-[#64748B]'
      )}
    >
      {display}
    </span>
  )
}
