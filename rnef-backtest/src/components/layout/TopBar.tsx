'use client'

import { usePathname } from 'next/navigation'
import { Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/stocks':      'Stock Universe',
  '/backtest':    'New Backtest',
  '/strategies':  'Strategy Library',
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/results/')) return 'Backtest Results'
  return PAGE_TITLES[pathname] ?? 'RNEF Analytics'
}

export function TopBar() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      <h1 className="text-[15px] font-semibold text-[#1E293B]">{title}</h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-[#1E293B]">
          <Bell size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-[#1E293B]">
          <Settings size={15} />
        </Button>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#002060] text-[11px] font-bold text-white">
          RF
        </div>
      </div>
    </header>
  )
}
