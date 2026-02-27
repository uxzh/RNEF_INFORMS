'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { CautionBanner } from '@/components/shared/CautionBanner'
import type { BacktestConfig, StrategyId, RebalanceFreq } from '@/types/backtest'
import { STRATEGY_META, FUND_INCEPTION } from '@/lib/constants'

const STRATEGY_OPTIONS: StrategyId[] = ['max-sharpe', 'min-vol', 'hrp', 'var-scaled', 'equal-weight']

const DEFAULT_CONFIG: BacktestConfig = {
  name: '',
  strategies: ['max-sharpe', 'hrp'],
  dateRange: { start: FUND_INCEPTION, end: new Date().toISOString().split('T')[0] },
  txCostBps: 10,
  rebalance: 'monthly',
  maxWeight: 0.4,
  walkForward: true,
}

export function ConfigForm() {
  const [config, setConfig] = useState<BacktestConfig>(DEFAULT_CONFIG)

  function toggleStrategy(id: StrategyId) {
    setConfig(prev => ({
      ...prev,
      strategies: prev.strategies.includes(id)
        ? prev.strategies.filter(s => s !== id)
        : [...prev.strategies, id],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Backtest Name */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Backtest Name
        </Label>
        <Input
          placeholder="e.g. Walk-Forward Q1 2026"
          value={config.name}
          onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
          className="text-[12.5px]"
        />
      </div>

      {/* Strategy Selection */}
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Strategies
        </Label>
        <div className="space-y-2">
          {STRATEGY_OPTIONS.map(id => {
            const meta = STRATEGY_META[id]
            const checked = config.strategies.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleStrategy(id)}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: checked ? meta.color + '60' : '#E2E8F0',
                  backgroundColor: checked ? meta.color + '08' : 'transparent',
                }}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-sm border-2 transition-colors"
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

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Start Date
          </Label>
          <Input
            type="date"
            value={config.dateRange.start}
            onChange={e => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
            className="text-[12.5px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            End Date
          </Label>
          <Input
            type="date"
            value={config.dateRange.end}
            onChange={e => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
            className="text-[12.5px]"
          />
        </div>
      </div>

      {/* Rebalancing Frequency */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
          Rebalancing Frequency
        </Label>
        <Select
          value={config.rebalance}
          onValueChange={v => setConfig(prev => ({ ...prev, rebalance: v as RebalanceFreq }))}
        >
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
          <span className="text-[12.5px] font-semibold text-[#1E293B]">
            {config.txCostBps} bps
          </span>
        </div>
        <Slider
          min={0}
          max={50}
          step={1}
          value={[config.txCostBps]}
          onValueChange={([v]) => setConfig(prev => ({ ...prev, txCostBps: v }))}
        />
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
          <span className="text-[12.5px] font-semibold text-[#1E293B]">
            {(config.maxWeight * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          min={10}
          max={60}
          step={5}
          value={[config.maxWeight * 100]}
          onValueChange={([v]) => setConfig(prev => ({ ...prev, maxWeight: v / 100 }))}
        />
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
        <Switch
          checked={config.walkForward}
          onCheckedChange={v => setConfig(prev => ({ ...prev, walkForward: v }))}
        />
      </div>

      <CautionBanner
        message="Walk-forward simulation rebalances at each period start using only prior data. 10 bps transaction costs applied per trade."
        variant="info"
      />

      {/* Submit */}
      <Button
        className="w-full bg-[#002060] text-white hover:bg-[#003087]"
        disabled={config.strategies.length === 0}
      >
        <Play size={13} className="mr-2" />
        Run Backtest
      </Button>
      <p className="text-center text-[10.5px] text-[#94A3B8]">
        Backend connection coming soon
      </p>
    </div>
  )
}
