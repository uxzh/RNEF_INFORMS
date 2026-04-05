'use client'

import { useEffect, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { StrategyCard } from '@/components/backtest/StrategyCard'
import { STRATEGY_META } from '@/lib/constants'
import type { BacktestRun, SavedStrategy, StrategyId } from '@/types/backtest'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAG_FILTERS = ['All', 'MVO', 'HRP', 'Risk-Based', 'Benchmark', 'Low-Vol']

const STRATEGY_TAGS: Record<StrategyId, string[]> = {
  'max-sharpe':   ['MVO'],
  'min-vol':      ['Low-Vol', 'Risk-Based'],
  'hrp':          ['HRP', 'Risk-Based'],
  'var-scaled':   ['Risk-Based'],
  'equal-weight': ['Benchmark'],
  'rnef-actual':  ['Benchmark'],
}

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  'max-sharpe':   'Mean-variance optimization maximizing Sharpe ratio.',
  'hrp':          'Hierarchical Risk Parity — robust to estimation error.',
  'var-scaled':   'Position sizes inversely proportional to historical VaR.',
  'equal-weight': 'Naive 1/N benchmark — equal allocation across all assets.',
  'min-vol':      'Global minimum variance portfolio.',
}

interface LibraryEntry {
  saved: SavedStrategy
  runId: string
}

function loadEntries(): LibraryEntry[] {
  try {
    const ids = JSON.parse(localStorage.getItem('backtest_run_ids') ?? '[]') as string[]
    const entries: LibraryEntry[] = []
    for (const id of ids) {
      const raw = localStorage.getItem(`backtest_run_${id}`)
      if (!raw) continue
      const run = JSON.parse(raw) as BacktestRun
      for (const result of run.results ?? []) {
        entries.push({
          runId: id,
          saved: {
            id: `${id}__${result.strategyId}`,
            name: run.name,
            type: result.strategyId,
            description: `${STRATEGY_DESCRIPTIONS[result.strategyId] ?? ''} · ${run.dateRange.start} → ${run.dateRange.end}`,
            lastRun: run.createdAt,
            sharpe: result.sharpeRatio,
            annReturn: result.expectedReturn,
            tags: [...(STRATEGY_TAGS[result.strategyId] ?? []), run.rebalance],
          },
        })
      }
    }
    return entries
  } catch {
    return []
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StrategyLibraryPage() {
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setEntries(loadEntries())
  }, [])

  const filtered = entries.filter(({ saved }) => {
    const matchesTab =
      activeTab === 'All' || saved.tags.includes(activeTab)
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      saved.name.toLowerCase().includes(q) ||
      (STRATEGY_META[saved.type]?.label ?? '').toLowerCase().includes(q) ||
      saved.tags.some(t => t.toLowerCase().includes(q))
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Strategy Library"
          sub={
            entries.length === 0
              ? 'Strategies will appear here after your first backtest'
              : `${entries.length} result${entries.length !== 1 ? 's' : ''} across ${new Set(entries.map(e => e.runId)).size} run${new Set(entries.map(e => e.runId)).size !== 1 ? 's' : ''}`
          }
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
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={entries.length === 0}
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

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-white py-20 text-center">
          <p className="text-[13px] font-semibold text-[#1E293B]">No backtests yet</p>
          <p className="mt-1 text-[11px] text-[#94A3B8]">
            Run a backtest to see strategy results here.
          </p>
          <Link
            href="/backtest"
            className="mt-4 rounded-md bg-[#002060] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#003087]"
          >
            Run a Backtest
          </Link>
        </div>
      )}

      {/* No results for current filter */}
      {entries.length > 0 && filtered.length === 0 && (
        <div className="py-12 text-center text-[12px] text-[#94A3B8]">
          No strategies match your filter.
        </div>
      )}

      {/* Cards grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(({ saved, runId }) => (
            <StrategyCard
              key={saved.id}
              strategy={saved}
              href={`/results/${runId}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
