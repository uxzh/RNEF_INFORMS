import { AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CautionBannerProps {
  message: string
  variant?: 'warning' | 'info'
  className?: string
}

export function CautionBanner({ message, variant = 'warning', className }: CautionBannerProps) {
  const isWarning = variant === 'warning'
  const Icon = isWarning ? AlertTriangle : Info

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[12px]',
        isWarning
          ? 'border-[#D97706]/20 bg-[#D97706]/5 text-[#92400E]'
          : 'border-[#1D4ED8]/20 bg-[#1D4ED8]/5 text-[#1E3A8A]',
        className
      )}
    >
      <Icon size={13} className="mt-0.5 shrink-0" strokeWidth={2} />
      <span>{message}</span>
    </div>
  )
}
