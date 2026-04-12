'use client'

import { useState, useEffect } from 'react'
import { Play, X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { CautionBanner } from '@/components/shared/CautionBanner'
import type { BacktestConfig, StrategyId, RebalanceFreq } from '@/types/backtest'
import { STRATEGY_META, FUND_INCEPTION } from '@/lib/constants'
import { getPortfolioTickers } from '@/lib/portfolio'
import { validateTickers } from '@/lib/api'

interface ConfigFormProps {
  onSubmit: (config: BacktestConfig, onProgress?: (stage: string, pct: number) => void) => Promise<void>;
}

const STRATEGY_OPTIONS: StrategyId[] = ['max-sharpe', 'min-vol', 'hrp', 'var-scaled', 'equal-weight']

export function ConfigForm({ onSubmit }: ConfigFormProps) {
  const [name, setName] = useState('')
  const [strategy, setStrategy] = useState<StrategyId>('max-sharpe')
  const [dateRange, setDateRange] = useState({ start: FUND_INCEPTION, end: new Date().toISOString().split('T')[0] })
  const [txCostBps, setTxCostBps] = useState(10)
  const [rebalance, setRebalance] = useState<RebalanceFreq>('monthly')
  const [maxWeight, setMaxWeight] = useState(0.4)
  const [walkForward, setWalkForward] = useState(true)

  // Tickers: base comes from dashboard portfolio, extras added for this run only
  const [baseTickers, setBaseTickers] = useState<string[]>([])
  const [extraTickers, setExtraTickers] = useState<string[]>([])
  const [tickerInput, setTickerInput] = useState('')
  const [tickerError, setTickerError] = useState('')
  const [validatingTicker, setValidatingTicker] = useState(false)

  const [loading, setLoading] = useState(false)
  const [progressStage, setProgressStage] = useState('')
  const [progressPct, setProgressPct] = useState(0)

  useEffect(() => {
    setBaseTickers(getPortfolioTickers())
  }, [])

  async function addExtraTicker() {
    const t = tickerInput.trim().toUpperCase()
    if (!t) return
    if (baseTickers.includes(t) || extraTickers.includes(t)) {
      setTickerError(`${t} is already in the list`)
      return
    }
    setValidatingTicker(true)
    setTickerError('')
    const { invalid } = await validateTickers([t], dateRange.start, dateRange.end)
    setValidatingTicker(false)
    if (invalid.length) {
      setTickerError(`${t} — no price data found in the selected date range.`)
      return
    }
    setExtraTickers(prev => [...prev, t])
    setTickerInput('')
  }

  function removeExtraTicker(t: string) {
    setExtraTickers(prev => prev.filter(x => x !== t))
  }

  async function handleSubmit() {
    setLoading(true)
    setProgressStage('Starting...')
    setProgressPct(0)
    const config: BacktestConfig = {
      name,
      strategies: [strategy],
      tickers: [...baseTickers, ...extraTickers],
      dateRange,
      txCostBps,
      rebalance,
      maxWeight,
      walkForward,
    }
    try {
      await onSubmit(config, (stage, pct) => {
        setProgressStage(stage)
        setProgressPct(pct)
      })
    } catch (err) {
      console.error('Backtest request failed', err)
    } finally {
      setLoading(false)
      setProgressStage('')
      setProgressPct(0)
    }
  }

  const allTickers = [...baseTickers, ...extraTickers]

  return (
    <div className="space-y-6">
      {/* Backtest Name */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Backtest Name
        </Label>
        <Input
          placeholder="e.g. Walk-Forward Q1 2026"
          value={name}
          onChange={e => setName(e.target.value)}
          className="text-[12.5px]"
        />
      </div>

      {/* Strategy Selection */}
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Strategy
        </Label>
        <div className="space-y-2">
          {STRATEGY_OPTIONS.map(id => {
            const meta = STRATEGY_META[id]
            const checked = strategy === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStrategy(id)}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: checked ? meta.color + '60' : '#E2E8F0',
                  backgroundColor: checked ? meta.color + '08' : 'transparent',
                }}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: checked ? meta.color : '#CBD5E1',
                    backgroundColor: checked ? meta.color : 'transparent',
                  }}
                />
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-[12.5px] font-medium text-[#1E293B]">{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ticker Universe */}
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Ticker Universe
          <span className="ml-1.5 normal-case font-normal text-[#94A3B8]">({allTickers.length} stocks)</span>
        </Label>

        {/* Base tickers — locked, from dashboard */}
        <div className="flex flex-wrap gap-1.5">
          {baseTickers.map(t => (
            <span
              key={t}
              className="rounded-md border border-[#E2E8F0] bg-[#F1F5F9] px-2 py-0.5 text-[10.5px] font-semibold text-[#64748B]"
              title="From dashboard portfolio"
            >
              {t}
            </span>
          ))}
          {/* Extra tickers — removable */}
          {extraTickers.map(t => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-md border border-[#002060]/30 bg-[#002060]/5 px-2 py-0.5 text-[10.5px] font-semibold text-[#002060]"
            >
              {t}
              <button onClick={() => removeExtraTicker(t)} className="hover:text-[#DC143C] transition-colors">
                <X size={9} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>

        {/* Add extra ticker */}
        <div className="flex gap-2">
          <Input
            placeholder="Add extra ticker…"
            value={tickerInput}
            onChange={e => { setTickerInput(e.target.value.toUpperCase()); setTickerError('') }}
            onKeyDown={e => e.key === 'Enter' && !validatingTicker && addExtraTicker()}
            className="max-w-[180px] text-[12px]"
            disabled={validatingTicker}
          />
          <button
            onClick={addExtraTicker}
            disabled={validatingTicker || !tickerInput.trim()}
            className="flex h-9 items-center gap-1 rounded-md border border-[#E2E8F0] px-3 text-[11px] font-semibold text-[#64748B] hover:border-[#002060] hover:text-[#002060] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {validatingTicker ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
            {validatingTicker ? 'Checking…' : 'Add'}
          </button>
        </div>
        {tickerError && <p className="text-[10px] text-[#DC143C]">{tickerError}</p>}
        <p className="text-[10px] text-[#94A3B8]">
          Grey = dashboard base · Blue = added for this run only
        </p>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Start Date
          </Label>
          <Input
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="text-[12.5px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            End Date
          </Label>
          <Input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="text-[12.5px]"
          />
        </div>
      </div>

      {/* Rebalancing Frequency */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Rebalancing Frequency
        </Label>
        <Select value={rebalance} onValueChange={v => setRebalance(v as RebalanceFreq)}>
          <SelectTrigger className="text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Cost */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Transaction Cost
          </Label>
          <span className="text-[12.5px] font-semibold text-[#1E293B]">{txCostBps} bps</span>
        </div>
        <Slider min={0} max={50} step={1} value={[txCostBps]} onValueChange={([v]) => setTxCostBps(v)} />
        <div className="flex justify-between text-[10px] text-[#94A3B8]">
          <span>0 bps</span><span>50 bps</span>
        </div>
      </div>

      {/* Max Position Weight */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Max Position Weight
          </Label>
          <span className="text-[12.5px] font-semibold text-[#1E293B]">{(maxWeight * 100).toFixed(0)}%</span>
        </div>
        <Slider min={10} max={60} step={5} value={[maxWeight * 100]} onValueChange={([v]) => setMaxWeight(v / 100)} />
        <div className="flex justify-between text-[10px] text-[#94A3B8]">
          <span>10%</span><span>60%</span>
        </div>
      </div>

      {/* Walk-Forward Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
        <div>
          <p className="text-[12.5px] font-medium text-[#1E293B]">Walk-Forward Simulation</p>
          <p className="text-[11px] text-[#64748B]">Prevents look-ahead bias</p>
        </div>
        <Switch checked={walkForward} onCheckedChange={setWalkForward} />
      </div>

      <CautionBanner
        message="Walk-forward simulation rebalances at each period start using only prior data. 10 bps transaction costs applied per trade."
        variant="info"
      />

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full bg-[#002060] text-white hover:bg-[#003087]"
        disabled={allTickers.length < 3 || loading}
      >
        <Play size={13} className="mr-2" />
        {loading ? 'Running...' : 'Run Backtest'}
      </Button>

      {/* progress bar shown during backtest */}
      {loading && progressStage && (
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#002060] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-center text-[10.5px] text-[#64748B]">{progressStage}</p>
        </div>
      )}

      {!loading && (
        <p className="text-center text-[10.5px] text-[#94A3B8]">
          Results will display below
        </p>
      )}
    </div>
  )
}
