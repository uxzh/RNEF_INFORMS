export type StrategyId =
  | 'max-sharpe'
  | 'min-vol'
  | 'hrp'
  | 'var-scaled'
  | 'equal-weight'
  | 'rnef-actual'

export type RebalanceFreq = 'monthly' | 'quarterly' | 'annual'
export type BacktestStatus = 'complete' | 'running' | 'failed'

export interface StrategyMeta {
  id: StrategyId
  label: string
  color: string
  dashed?: boolean
}

export interface EquityCurvePoint {
  date: string
  [strategyId: string]: number | string
}

export interface PerformanceRow {
  strategy: StrategyId
  annReturn: number
  annVol: number
  sharpe: number
  maxDD: number
  calmar: number
  turnover: number | null
  highlight?: 'best' | 'rnef'
}

export interface BacktestRun {
  id: string
  name: string
  createdAt: string
  status: BacktestStatus
  strategies: StrategyId[]
  dateRange: { start: string; end: string }
  txCost: number
  rebalance: RebalanceFreq
  bestStrategy?: StrategyId
  bestSharpe?: number
}

export interface BacktestConfig {
  name: string
  strategies: StrategyId[]
  dateRange: { start: string; end: string }
  txCostBps: number
  rebalance: RebalanceFreq
  maxWeight: number
  walkForward: boolean
}

export interface SavedStrategy {
  id: string
  name: string
  type: StrategyId
  description: string
  lastRun: string
  sharpe: number
  annReturn: number
  tags: string[]
}
