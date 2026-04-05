import * as XLSX from 'xlsx'
import path from 'path'
import type { Holding, PortfolioSummary } from '@/types/holdings'
import { MOCK_HOLDINGS, MOCK_PORTFOLIO_SUMMARY } from './mock-data'

const EXCEL_PATH = path.resolve('C:/Programs/RNEF/Master Portfolio Tracker vExternal.xlsx')

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val)
  return isFinite(n) ? n : fallback
}

export function readHoldings(): Holding[] {
  try {
    const wb = XLSX.readFile(EXCEL_PATH)

    // Try to find the holdings sheet (common names)
    const sheetName =
      wb.SheetNames.find(n => /holding/i.test(n)) ??
      wb.SheetNames.find(n => /position/i.test(n)) ??
      wb.SheetNames[0]

    if (!sheetName) return MOCK_HOLDINGS

    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

    if (!rows.length) return MOCK_HOLDINGS

    // Flexible column mapping — handles varied header names
    const colMap = (row: Record<string, unknown>, keys: string[]): unknown => {
      for (const k of keys) {
        const match = Object.keys(row).find(h => h.toLowerCase().includes(k.toLowerCase()))
        if (match) return row[match]
      }
      return undefined
    }

    const holdings: Holding[] = rows
      .filter(row => {
        const ticker = String(colMap(row, ['ticker', 'symbol']) ?? '').trim()
        return ticker.length > 0 && ticker !== 'Ticker'
      })
      .map(row => ({
        ticker:       String(colMap(row, ['ticker', 'symbol']) ?? '').trim(),
        company:      String(colMap(row, ['company', 'name', 'security']) ?? '').trim(),
        sector:       String(colMap(row, ['sector', 'industry', 'category']) ?? '').trim() || undefined,
        weight:       safeNum(colMap(row, ['weight', 'allocation', '%'])),
        entryPrice:   safeNum(colMap(row, ['entry', 'cost', 'purchase'])),
        currentPrice: safeNum(colMap(row, ['current', 'price', 'last'])),
        totalReturn:  safeNum(colMap(row, ['return', 'gain', 'pnl'])),
        daysHeld:     safeNum(colMap(row, ['days', 'held', 'age'])),
        stopLoss:     safeNum(colMap(row, ['stop', 'stoploss'])),
        rrRatio:      safeNum(colMap(row, ['r/r', 'rr', 'risk'])),
        irr:          safeNum(colMap(row, ['irr', 'internal'])),
      }))

    return holdings.length > 0 ? holdings : MOCK_HOLDINGS
  } catch {
    // Excel file not found or unreadable — fall back to mock data
    return MOCK_HOLDINGS
  }
}

export function readPortfolioSummary(): PortfolioSummary {
  try {
    const wb = XLSX.readFile(EXCEL_PATH)
    // Summary data is usually on the first sheet or a "Summary" sheet
    const sheetName =
      wb.SheetNames.find(n => /summary|overview|nav/i.test(n)) ??
      wb.SheetNames[0]

    if (!sheetName) return MOCK_PORTFOLIO_SUMMARY
    // For now return mock — full parsing would need the actual sheet schema
    return MOCK_PORTFOLIO_SUMMARY
  } catch {
    return MOCK_PORTFOLIO_SUMMARY
  }
}
