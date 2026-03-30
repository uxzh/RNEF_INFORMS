'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionTitle } from '@/components/shared/SectionTitle'

const TAG_FILTERS = ['All', 'MVO', 'HRP', 'Risk-Based', 'Benchmark', 'Low-Vol']

function StrategyCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-3.5 w-36" />
      </div>
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-3/4" />
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1.5">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-5 w-10" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
        <div className="flex gap-1">
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <Skeleton className="h-2.5 w-24" />
      </div>
    </div>
  )
}

export default function StrategyLibraryPage() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Strategy Library"
          sub="Strategies will appear here after your first backtest"
        />
        <Button className="h-8 bg-[#002060] text-[11px] text-white hover:bg-[#003087]" disabled>
          <Plus size={12} className="mr-1.5" />
          New Strategy
        </Button>
      </div>

      {/* Search + Tabs */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            placeholder="Search strategies…"
            className="pl-8 text-[12.5px]"
            disabled
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            {TAG_FILTERS.map(t => (
              <TabsTrigger key={t} value={t} className="text-[11px] px-3">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Skeleton Grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StrategyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
