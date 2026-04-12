/**
 * Shared optimization utilities used by max-sharpe and min-vol strategies.
 *
 * projectToSimplex: constrains portfolio weights to valid allocations (sum=1, each <= maxWeight)
 * regularizedCov: makes covariance matrix invertible by adding a tiny ridge to the diagonal
 * riskScale: computes gradient step size from the largest eigenvalue
 */
import { covMatrix, eigvalsh } from './matrix'

// clamp max weight to valid range: at least 1/N, at most 1
export function capMaxWeight(nAssets: number, maxWeight: number): number {
  return Math.min(Math.max(maxWeight, 1 / nAssets), 1)
}

// project weights onto the simplex {w >= 0, w_i <= maxWeight, sum(w) = 1}
// uses bisection: shift all weights by a constant until they sum to 1 after clipping
// 80 iterations gives ~24 digits of precision, more than enough
export function projectToSimplex(weights: number[], maxWeight: number): number[] {
  const n = weights.length
  let lo = Math.min(...weights) - maxWeight
  let hi = Math.max(...weights)

  for (let iter = 0; iter < 80; iter++) {
    const mid = 0.5 * (lo + hi)
    const clipped = weights.map(w => Math.min(Math.max(w - mid, 0), maxWeight))
    const s = clipped.reduce((a, b) => a + b, 0)
    if (s > 1) lo = mid
    else hi = mid
  }

  const projected = weights.map(w => Math.min(Math.max(w - hi, 0), maxWeight))
  const total = projected.reduce((a, b) => a + b, 0)
  if (total <= 0) return new Array(n).fill(1 / n)
  return projected.map(w => w / total)
}

// covariance + ridge regularization for numerical stability
export function regularizedCov(data: number[][]): number[][] {
  const cov = covMatrix(data)
  const n = cov.length

  // symmetrize (handle floating point)
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const avg = 0.5 * (cov[i][j] + cov[j][i])
      cov[i][j] = avg
      cov[j][i] = avg
    }

  // add small ridge to diagonal for positive-definiteness
  let diagSum = 0
  for (let i = 0; i < n; i++) diagSum += cov[i][i]
  const ridge = (diagSum / n) * 1e-6

  for (let i = 0; i < n; i++) cov[i][i] += ridge
  return cov
}

// largest eigenvalue — used for gradient step size
export function riskScale(cov: number[][]): number {
  try {
    const vals = eigvalsh(cov)
    return vals[vals.length - 1] // max eigenvalue
  } catch {
    // fallback: max diagonal element
    let mx = 0
    for (let i = 0; i < cov.length; i++) mx = Math.max(mx, cov[i][i])
    return mx
  }
}
