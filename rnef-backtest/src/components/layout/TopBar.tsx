'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
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
    <header className="flex h-[56px] shrink-0 items-center border-b border-[#E2E8F0] bg-white px-6">
      <h1 className="text-[15px] font-semibold text-[#1E293B]">{title}</h1>
    </header>
  )
}
