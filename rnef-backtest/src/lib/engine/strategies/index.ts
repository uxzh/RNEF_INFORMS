import { optimize as equalWeight } from './equal-weight'
import { optimize as hrp } from './hrp'
import { optimize as minVol } from './min-vol'
import { optimize as maxSharpe } from './max-sharpe'
import { optimize as varScaled } from './var-scaled'

export function runStrategy(
  strategyId: string,
  returns: number[][],
  maxWeight: number
): number[] {
  switch (strategyId) {
    case 'equal-weight':
      return equalWeight(returns)
    case 'hrp':
      return hrp(returns)
    case 'min-vol':
      return minVol(returns, maxWeight)
    case 'max-sharpe':
      return maxSharpe(returns, maxWeight)
    case 'var-scaled':
      return varScaled(returns, maxWeight)
    default:
      throw new Error(`Unknown strategy: ${strategyId}`)
  }
}
