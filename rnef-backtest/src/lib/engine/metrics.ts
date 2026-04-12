import { dot, colMeans, covMatrix, vecMatVec, cumProd, maxAccumulate } from './matrix'

function applyTxCost(before: number[], after: number[], bps: number): number {
  let turnover = 0
  for (let i = 0; i < before.length; i++) turnover += Math.abs(after[i] - before[i])
  return turnover * (bps / 10_000)
}

export function computeMetrics(
  weights: number[],
  returns: number[][],
  txCostBps: number
): { annReturn: number; annVol: number; sharpe: number } {
  const meanRet = colMeans(returns)
  const cov = covMatrix(returns)
  const n = weights.length

  const portReturn = dot(weights, meanRet) * 252
  const portVol = Math.sqrt(Math.max(vecMatVec(weights, cov), 0) * 252)

  // transaction cost vs equal weight baseline (annualized)
  const equal = new Array(n).fill(1 / n)
  const cost = applyTxCost(equal, weights, txCostBps) * 252
  const netReturn = portReturn - cost

  const sharpe = portVol > 0 ? netReturn / portVol : 0

  return {
    annReturn: Math.round(netReturn * 10000) / 10000,
    annVol: Math.round(portVol * 10000) / 10000,
    sharpe: Math.round(sharpe * 10000) / 10000,
  }
}

export function computeTimeSeries(
  weights: number[],
  returns: number[][],
  dates: string[],
  txCostBps: number
): {
  equityCurve: Array<{ date: string; value: number }>
  drawdown: Array<{ date: string; drawdown: number }>
  monthlyReturns: Array<{ year: number; month: number; value: number }>
  maxDD: number
  calmar: number
  turnover: number
} {
  const n = weights.length
  const nPeriods = returns.length

  // daily portfolio returns = returns_matrix @ weights
  const portReturns = returns.map(row => dot(row, weights))

  // apply one-time transaction cost on first day
  const equal = new Array(n).fill(1 / n)
  const cost = applyTxCost(equal, weights, txCostBps)
  portReturns[0] -= cost

  // equity curve rebased to 100
  const growthFactors = portReturns.map(r => 1 + r)
  const cumulative = cumProd(growthFactors)
  const equity = cumulative.map(v => 100 * v)

  // drawdown series
  const peak = maxAccumulate(equity)
  const ddSeries = equity.map((e, i) => e / peak[i] - 1)
  const maxDD = Math.min(...ddSeries)

  // annualized return from equity curve
  const totalRet = equity[equity.length - 1] / 100
  const annReturn = Math.pow(totalRet, 252 / nPeriods) - 1
  const calmar = maxDD < 0 ? annReturn / Math.abs(maxDD) : 0

  // turnover vs equal weight
  let turnover = 0
  for (let i = 0; i < n; i++) turnover += Math.abs(weights[i] - 1 / n)

  // format equity curve and drawdown
  const equityCurve = dates.map((d, i) => ({
    date: d,
    value: Math.round(equity[i] * 10000) / 10000,
  }))
  const drawdown = dates.map((d, i) => ({
    date: d,
    drawdown: Math.round(ddSeries[i] * 1000000) / 1000000,
  }))

  // monthly returns: group by year-month, compound within group
  const monthMap = new Map<string, number[]>()
  for (let i = 0; i < nPeriods; i++) {
    const d = new Date(dates[i])
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!monthMap.has(key)) monthMap.set(key, [])
    monthMap.get(key)!.push(portReturns[i])
  }

  const monthlyReturns: Array<{ year: number; month: number; value: number }> = []
  for (const [key, rets] of monthMap) {
    const [y, m] = key.split('-').map(Number)
    // compound: product of (1 + r) - 1
    const compounded = rets.reduce((acc, r) => acc * (1 + r), 1) - 1
    monthlyReturns.push({
      year: y,
      month: m,
      value: Math.round(compounded * 10000) / 10000,
    })
  }

  return {
    equityCurve,
    drawdown,
    monthlyReturns,
    maxDD: Math.round(maxDD * 10000) / 10000,
    calmar: Math.round(calmar * 10000) / 10000,
    turnover: Math.round(turnover * 10000) / 10000,
  }
}
