import type { StrategyMeta, StrategyId } from '@/types/backtest'

export const STRATEGY_META: Record<StrategyId, StrategyMeta> = {
  'rnef-actual':  { id: 'rnef-actual',  label: 'RNEF Actual',      color: '#002060' },
  'max-sharpe':   { id: 'max-sharpe',   label: 'Max Sharpe (MVO)', color: '#2E8B57' },
  'hrp':          { id: 'hrp',          label: 'HRP',               color: '#7C3AED' },
  'var-scaled':   { id: 'var-scaled',   label: 'VaR-Scaled',        color: '#0891B2', dashed: true },
  'equal-weight': { id: 'equal-weight', label: 'Equal Weight',      color: '#94A3B8', dashed: true },
  'min-vol':      { id: 'min-vol',      label: 'Min Volatility',    color: '#uv1D4ED8' },
}

export const FUND_INCEPTION = '2022-10-13'

export const NAV_COLORS = {
  navy:   '#002060',
  green:  '#2E8B57',
  blue:   '#1D4ED8',
  amber:  '#D97706',
  red:    '#DC143C',
  purple: '#7C3AED',
  teal:   '#0F766E',
} as const
