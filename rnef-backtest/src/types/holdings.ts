export interface Holding {
  ticker: string
  company: string
  sector?: string
  weight: number       // 0–1, e.g. 0.215
  entryPrice: number
  currentPrice: number
  totalReturn: number  // decimal, e.g. 0.031
  daysHeld: number
  stopLoss: number
  rrRatio: number
  irr: number
}

export interface PortfolioSummary {
  nav: number
  totalReturn: number  // decimal
  vsIcln: number       // outperformance vs ICLN
  sharpe: number
  maxDrawdown: number  // negative decimal
  lastUpdated: string
}
