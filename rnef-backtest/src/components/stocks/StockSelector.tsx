'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Play, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Holding } from '@/types/holdings'

const STORAGE_KEY = 'rnef:selectedTickers'

type SortKey = 'weight-desc' | 'weight-asc' | 'ticker' | 'return-desc' | 'irr-desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'weight-desc', label: 'Weight ↓' },
  { value: 'weight-asc',  label: 'Weight ↑' },
  { value: 'ticker',      label: 'A → Z' },
  { value: 'return-desc', label: 'Return ↓' },
  { value: 'irr-desc',    label: 'IRR ↓' },
]

// Sector badge colors — subtle tints
const SECTOR_COLORS: Record<string, { bg: string; text: string; activeBg: string }> = {
  Utilities:   { bg: '#F0F9FF', text: '#0369A1', activeBg: '#0369A1' },
  Technology:  { bg: '#F0FDF4', text: '#15803D', activeBg: '#15803D' },
  Industrials: { bg: '#FFF7ED', text: '#C2410C', activeBg: '#C2410C' },
  Energy:      { bg: '#FEF9C3', text: '#A16207', activeBg: '#A16207' },
  Healthcare:  { bg: '#FDF4FF', text: '#7E22CE', activeBg: '#7E22CE' },
}
function sectorStyle(sector: string, active: boolean) {
  const c = SECTOR_COLORS[sector] ?? { bg: '#F1F5F9', text: '#475569', activeBg: '#475569' }
  return active
    ? { backgroundColor: c.activeBg, color: '#fff', borderColor: c.activeBg }
    : { backgroundColor: c.bg,       color: c.text, borderColor: 'transparent' }
}

export function StockSelector({ holdings }: { holdings: Holding[] }) {
  const router = useRouter()

  // Hydration: show skeletons until localStorage is read
  const [hydrated, setHydrated] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('weight-desc')
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set())

  // Mount: read from localStorage then reveal UI
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: string[] = JSON.parse(raw)
        const valid = parsed.filter(t => holdings.some(h => h.ticker === t))
        setSelected(valid.length > 0 ? new Set(valid) : new Set(holdings.map(h => h.ticker)))
      } else {
        setSelected(new Set(holdings.map(h => h.ticker)))
      }
    } catch {
      setSelected(new Set(holdings.map(h => h.ticker)))
    }
    setHydrated(true)
  }, [holdings])

  // Persist selection
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected])) } catch {}
  }, [selected, hydrated])

  // Derived: sectors list + per-sector counts
  const sectors = useMemo(
    () => Array.from(new Set(holdings.map(h => h.sector).filter(Boolean) as string[])).sort(),
    [holdings],
  )
  const sectorCounts = useMemo(
    () => Object.fromEntries(sectors.map(s => [s, holdings.filter(h => h.sector === s).length])),
    [holdings, sectors],
  )

  // Derived: filtered + sorted holdings
  const visible = useMemo(() => {
    let list = activeSectors.size > 0
      ? holdings.filter(h => h.sector && activeSectors.has(h.sector))
      : [...holdings]
    switch (sortBy) {
      case 'weight-asc':  list.sort((a, b) => a.weight - b.weight); break
      case 'ticker':      list.sort((a, b) => a.ticker.localeCompare(b.ticker)); break
      case 'return-desc': list.sort((a, b) => b.totalReturn - a.totalReturn); break
      case 'irr-desc':    list.sort((a, b) => b.irr - a.irr); break
      default:            list.sort((a, b) => b.weight - a.weight)
    }
    return list
  }, [holdings, activeSectors, sortBy])

  const allSelected = selected.size === holdings.length
  const noneSelected = selected.size === 0

  // Handlers — memoized to avoid child re-renders
  const toggle = useCallback((ticker: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(ticker) ? next.delete(ticker) : next.add(ticker)
      return next
    })
  }, [])

  const selectAll = useCallback(
    () => setSelected(new Set(holdings.map(h => h.ticker))),
    [holdings],
  )
  const clearAll = useCallback(() => setSelected(new Set()), [])

  const toggleSector = useCallback((s: string) => {
    setActiveSectors(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }, [])

  const selectVisible = useCallback(
    () => setSelected(prev => new Set([...prev, ...visible.map(h => h.ticker)])),
    [visible],
  )

  return (
    <div className="space-y-4">

      {/* Controls row: sort + quick-actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={12} className="text-[#94A3B8]" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Sort</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value)}
                className="rounded-md px-2 py-1 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: sortBy === opt.value ? '#002060' : '#F1F5F9',
                  color: sortBy === opt.value ? '#fff' : '#64748B',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick-actions — always the same buttons, no layout shift */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectAll}
            disabled={allSelected}
            className="text-[11.5px] font-semibold text-[#002060] disabled:cursor-default disabled:opacity-35 hover:underline"
          >
            Select All
          </button>
          <span className="text-[#CBD5E1] select-none">·</span>
          <button
            type="button"
            onClick={clearAll}
            disabled={noneSelected}
            className="text-[11.5px] font-semibold text-[#64748B] disabled:cursor-default disabled:opacity-35 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Sector filter chips — only shown when sector data exists */}
      {sectors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sectors.map(s => {
            const active = activeSectors.has(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSector(s)}
                className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all"
                style={sectorStyle(s, active)}
              >
                {active && <Check size={9} strokeWidth={3} />}
                {s}
                <span
                  className="ml-0.5 rounded-full px-1 text-[10px] font-bold"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)' }}
                >
                  {sectorCounts[s]}
                </span>
              </button>
            )
          })}
          {activeSectors.size > 0 && (
            <>
              <span className="text-[#E2E8F0] select-none">|</span>
              <button
                type="button"
                onClick={selectVisible}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#2E8B57] hover:underline"
              >
                Select these
              </button>
              <button
                type="button"
                onClick={() => setActiveSectors(new Set())}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#94A3B8] hover:text-[#64748B]"
              >
                Clear ×
              </button>
            </>
          )}
        </div>
      )}

      {/* Badge grid */}
      {!hydrated ? (
        // Skeleton during SSR / before localStorage hydration
        <div className="flex flex-wrap gap-2">
          {holdings.map(h => (
            <Skeleton key={h.ticker} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map(h => {
            const isSelected = selected.has(h.ticker)
            return (
              <button
                key={h.ticker}
                type="button"
                onClick={() => toggle(h.ticker)}
                className="flex h-8 items-center gap-1.5 rounded-full border px-3 transition-all active:scale-95"
                style={{
                  borderColor:     isSelected ? '#002060' : '#E2E8F0',
                  backgroundColor: isSelected ? '#002060' : '#FFFFFF',
                  color:           isSelected ? '#FFFFFF' : '#1E293B',
                }}
              >
                {isSelected && <Check size={10} strokeWidth={2.5} className="shrink-0 opacity-80" />}
                <span className="text-[12px] font-bold tracking-wide">{h.ticker}</span>
                <span
                  className="text-[11px]"
                  style={{ opacity: isSelected ? 0.65 : 0.5 }}
                >
                  {(h.weight * 100).toFixed(1)}%
                </span>
              </button>
            )
          })}
          {visible.length === 0 && (
            <p className="py-2 text-[12.5px] text-[#94A3B8]">No holdings match the current filter.</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-4">
        <p className="text-[12.5px] text-[#64748B]">
          <span className="font-semibold text-[#1E293B]">{selected.size}</span>
          {' '}of{' '}
          <span className="font-semibold text-[#1E293B]">{holdings.length}</span>
          {' '}holdings selected
          {activeSectors.size > 0 && (
            <span className="ml-1.5 text-[11px] text-[#94A3B8]">
              ({visible.length} shown)
            </span>
          )}
        </p>
        <Button
          disabled={noneSelected}
          onClick={() => router.push('/backtest')}
          className="bg-[#002060] text-white hover:bg-[#003087]"
          size="sm"
        >
          <Play size={11} className="mr-1.5" />
          Configure Backtest
        </Button>
      </div>
    </div>
  )
}
