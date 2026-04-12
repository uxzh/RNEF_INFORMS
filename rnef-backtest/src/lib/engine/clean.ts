// remove tickers (columns) and rows with NaN/Infinity from a returns matrix
export function cleanReturns(
  data: number[][],
  tickers: string[]
): { data: number[][]; tickers: string[] } {
  if (data.length === 0 || tickers.length === 0) return { data: [], tickers: [] }

  const nCols = tickers.length

  // find columns that have at least some valid data
  const validCols: number[] = []
  for (let c = 0; c < nCols; c++) {
    let hasValid = false
    for (const row of data) {
      const v = row[c]
      if (Number.isFinite(v)) { hasValid = true; break }
    }
    if (hasValid) validCols.push(c)
  }

  const filteredTickers = validCols.map(c => tickers[c])

  // keep only rows where ALL remaining columns are finite
  const filteredData: number[][] = []
  for (const row of data) {
    const newRow = validCols.map(c => {
      const v = row[c]
      return Number.isFinite(v) ? v : 0
    })
    if (newRow.every(Number.isFinite)) filteredData.push(newRow)
  }

  return { data: filteredData, tickers: filteredTickers }
}
