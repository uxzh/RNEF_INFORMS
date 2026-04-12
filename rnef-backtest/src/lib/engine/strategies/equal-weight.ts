export function optimize(returns: number[][]): number[] {
  const n = returns[0].length
  return new Array(n).fill(1 / n)
}
