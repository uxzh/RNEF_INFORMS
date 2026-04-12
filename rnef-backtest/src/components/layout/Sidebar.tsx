'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Play,
  BarChart3,
  BookOpen,
  RefreshCw,
  Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/backtest',   icon: Play,            label: 'New Backtest' },
  { href: '/strategies', icon: BookOpen,        label: 'Strategy Library' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-[220px] shrink-0 flex-col bg-[#002060] text-white shadow-[2px_0_8px_rgba(0,0,0,0.18)]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2E8B57]">
          <Leaf size={16} strokeWidth={2.5} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold leading-tight">RNEF Analytics</div>
          <div className="truncate text-[10px] leading-tight text-white/50">Rice Renewable Energy Fund</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 py-3">
        <span className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Backtesting
        </span>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-[7px] text-[12.5px] font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/65 hover:bg-white/7 hover:text-white'
              )}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <button
          type="button"
          className="mb-2.5 flex w-full items-center gap-2 rounded-md bg-white/8 px-3 py-2 text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/12"
        >
          <RefreshCw size={11} />
          Refresh Market Data
        </button>
        <p className="text-[10px] leading-tight text-white/40">Last updated: Feb 22, 2026</p>
        <p className="mt-0.5 text-[10px] leading-tight text-white/25">yfinance · FRED</p>
      </div>
    </aside>
  )
}
