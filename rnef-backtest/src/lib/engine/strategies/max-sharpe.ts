import { dot, matVecMul, vecMatVec, colMeans, norm1, solve } from '../matrix'
import { regularizedCov, riskScale, projectToSimplex, capMaxWeight } from '../project'

function annualSharpe(
  weights: number[],
  meanRet: number[],
  cov: number[][],
  rf: number
): number {
  const annRet = dot(weights, meanRet) * 252
  const annVol = Math.sqrt(Math.max(vecMatVec(weights, cov), 0) * 252)
  if (annVol <= 0) return -Infinity
  return (annRet - rf) / annVol
}

// projected gradient ascent on utility U = w.mu - gamma/2 * w.Sigma.w
function utilitySolve(
  meanRet: number[],
  cov: number[][],
  maxWeight: number,
  gamma: number,
  start: number[]
): number[] {
  const scale = riskScale(cov)
  const step = 1 / Math.max(gamma * scale, 1e-8)
  let weights = [...start]

  for (let iter = 0; iter < 1500; iter++) {
    // gradient = mu - gamma * Sigma @ w
    const sigW = matVecMul(cov, weights)
    const grad = meanRet.map((m, i) => m - gamma * sigW[i])
    const next = projectToSimplex(
      weights.map((w, i) => w + step * grad[i]),
      maxWeight
    )
    if (norm1(next.map((v, i) => v - weights[i])) < 1e-10) break
    weights = next
  }
  return weights
}

// maximize sharpe ratio via tangency + grid search over risk aversion
export function optimize(returns: number[][], maxWeight: number): number[] {
  const n = returns[0].length
  if (n === 1) return [1]
  if (returns.length < 2) return new Array(n).fill(1 / n)

  const cap = capMaxWeight(n, maxWeight)
  const meanRet = colMeans(returns)
  const cov = regularizedCov(returns)
  const rf = 0

  // start with equal weight
  let bestWeights = projectToSimplex(new Array(n).fill(1 / n), cap)
  let bestScore = annualSharpe(bestWeights, meanRet, cov, rf)

  // try tangency portfolio: w = cov^-1 @ mu
  try {
    const raw = solve(cov, meanRet)
    // clean NaN/Inf
    const clean = raw.map(v => (Number.isFinite(v) ? v : 0))
    const proj = projectToSimplex(clean, cap)
    const score = annualSharpe(proj, meanRet, cov, rf)
    if (score > bestScore) {
      bestWeights = proj
      bestScore = score
    }
  } catch { /* matrix may be singular, skip */ }

  // grid search over 48 risk aversion values (logspace -2 to 4)
  let warmStart = [...bestWeights]
  for (let i = 0; i < 48; i++) {
    const gamma = Math.pow(10, -2 + (i * 6) / 47)
    const w = utilitySolve(meanRet, cov, cap, gamma, warmStart)
    const score = annualSharpe(w, meanRet, cov, rf)
    if (score > bestScore) {
      bestWeights = w
      bestScore = score
    }
    warmStart = w
  }

  return bestWeights
}
