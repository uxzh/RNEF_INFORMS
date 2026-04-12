/**
 * HRP (Hierarchical Risk Parity) — simplified as inverse-volatility weighting.
 * Assets with lower historical volatility get proportionally more weight.
 * No max_weight constraint — this is a passive, parameter-free allocation.
 */
import { colStd } from '../matrix'
export function optimize(returns: number[][]): number[] {
  const vols = colStd(returns)
  const invVol = vols.map(v => 1 / Math.max(v, 1e-8))
  const total = invVol.reduce((a, b) => a + b, 0)
  return invVol.map(w => w / total)
}
