import { colStd } from '../matrix'

// inverse-volatility weighting: assets with lower vol get more weight
export function optimize(returns: number[][]): number[] {
  const vols = colStd(returns)
  const invVol = vols.map(v => 1 / Math.max(v, 1e-8))
  const total = invVol.reduce((a, b) => a + b, 0)
  return invVol.map(w => w / total)
}
