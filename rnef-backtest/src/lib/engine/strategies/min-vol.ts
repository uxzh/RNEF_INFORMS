import { matVecMul, norm1 } from '../matrix'
import { regularizedCov, riskScale, projectToSimplex, capMaxWeight } from '../project'

// minimize portfolio variance via projected gradient descent
export function optimize(returns: number[][], maxWeight: number): number[] {
  const n = returns[0].length
  if (n === 1) return [1]
  if (returns.length < 2) return new Array(n).fill(1 / n)

  const cap = capMaxWeight(n, maxWeight)
  const cov = regularizedCov(returns)

  // step size = 1 / largest eigenvalue of covariance
  const scale = riskScale(cov)
  const step = 1 / Math.max(scale, 1e-8)

  let weights = projectToSimplex(new Array(n).fill(1 / n), cap)

  for (let iter = 0; iter < 4000; iter++) {
    // gradient of variance w.r.t. weights = cov @ weights
    const grad = matVecMul(cov, weights)
    const next = projectToSimplex(
      weights.map((w, i) => w - step * grad[i]),
      cap
    )
    if (norm1(next.map((v, i) => v - weights[i])) < 1e-10) break
    weights = next
  }

  return weights
}
