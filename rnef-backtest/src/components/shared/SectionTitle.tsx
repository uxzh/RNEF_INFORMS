import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  sub?: string
  action?: React.ReactNode
  className?: string
}

export function SectionTitle({ title, sub, action, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div>
        <h2 className="text-[12.5px] font-semibold text-[#1E293B]">{title}</h2>
        {sub && <p className="mt-0.5 text-[11px] text-[#64748B]">{sub}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}
