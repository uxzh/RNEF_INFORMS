import type { BacktestRun } from '@/types/backtest'
import type { Holding, PortfolioSummary } from '@/types/holdings'

// ---------------------------------------------------------------------------
// Fallback data — used by lib/excel.ts when the Excel file cannot be read.
// Replace these with real API calls once the Python backend is connected.
// ---------------------------------------------------------------------------

export const MOCK_BACKTEST_RUNS: BacktestRun[] = [
  {
    id: 'bt-001',
    name: 'Walk-Forward Q1 2026',
    createdAt: '2026-02-22',
    status: 'complete',
    strategies: ['max-sharpe', 'hrp', 'var-scaled', 'equal-weight', 'rnef-actual'],
    dateRange: { start: '2022-10-13', end: '2026-02-22' },
    txCost: 10,
    rebalance: 'monthly',
    bestStrategy: 'max-sharpe',
    bestSharpe: 0.98,
  },
]

export const MOCK_PORTFOLIO_SUMMARY: PortfolioSummary = {
  nav: 197756,
  totalReturn: 0.031,
  vsIcln: 0.063,
  sharpe: 0.75,
  maxDrawdown: -0.152,
  lastUpdated: '2026-02-22',
}

export const MOCK_HOLDINGS: Holding[] = [
  { ticker: 'XLU',  company: 'Utilities Select SPDR',    sector: 'Utilities',    weight: 0.215, entryPrice: 63.40, currentPrice: 68.92, totalReturn: 0.087,  daysHeld: 498, stopLoss: 61.20, rrRatio: 2.1, irr: 0.076 },
  { ticker: 'BWXT', company: 'BWX Technologies',          sector: 'Industrials',  weight: 0.112, entryPrice: 72.15, currentPrice: 89.34, totalReturn: 0.238,  daysHeld: 412, stopLoss: 69.00, rrRatio: 3.4, irr: 0.198 },
  { ticker: 'ULS',  company: 'UL Solutions',              sector: 'Industrials',  weight: 0.085, entryPrice: 38.60, currentPrice: 41.20, totalReturn: 0.067,  daysHeld: 287, stopLoss: 37.00, rrRatio: 1.8, irr: 0.084 },
  { ticker: 'TIC',  company: 'TransAlta Renewables',      sector: 'Utilities',    weight: 0.064, entryPrice: 11.20, currentPrice: 9.85,  totalReturn: -0.121, daysHeld: 356, stopLoss: 9.50,  rrRatio: 0.7, irr: -0.112 },
  { ticker: 'SHLS', company: 'Shoals Technologies',       sector: 'Technology',   weight: 0.052, entryPrice: 15.40, currentPrice: 12.30, totalReturn: -0.201, daysHeld: 189, stopLoss: 11.80, rrRatio: 0.5, irr: -0.298 },
  { ticker: 'ITRI', company: 'Itron Inc.',                sector: 'Technology',   weight: 0.035, entryPrice: 91.20, currentPrice: 98.75, totalReturn: 0.083,  daysHeld: 144, stopLoss: 88.00, rrRatio: 2.4, irr: 0.204 },
]
