/**
 * VaR-Scaled strategy — allocates more to lower-risk assets.
 *
 * The original Python version used scipy SLSQP, but since the objective
 * (minimize weighted VaR) is linear, this is actually a simple LP:
 * sort by VaR, fill lowest-risk assets to max_weight first.
 * Produces the same result without needing a constrained optimizer.
 */
import { quantile } from '../matrix'
export function optimize(returns: number[][], maxWeight: number): number[] {
  const n = returns[0].length
  const nRows = returns.length
  const confidence = 0.05
  const minWeight = 1 / (2 * n)

  // compute VaR (5th percentile absolute value) for each asset
  const var95: number[] = []
  for (let c = 0; c < n; c++) {
    const col = []
    for (let r = 0; r < nRows; r++) col.push(returns[r][c])
    const q = quantile(col, confidence)
    var95.push(Math.abs(q) || 1e-6)
  }

  // sort asset indices by VaR ascending (lowest risk first)
  const indices = Array.from({ length: n }, (_, i) => i)
  indices.sort((a, b) => var95[a] - var95[b])

  // greedily assign max_weight to lowest-VaR assets until budget runs out
  const weights = new Array(n).fill(minWeight)
  let budget = 1.0 - minWeight * n

  for (const idx of indices) {
    if (budget <= 0) break
    const add = Math.min(maxWeight - minWeight, budget)
    weights[idx] += add
    budget -= add
  }

  // renormalize to exactly 1.0
  const total = weights.reduce((a, b) => a + b, 0)
  return weights.map(w => w / total)
}
