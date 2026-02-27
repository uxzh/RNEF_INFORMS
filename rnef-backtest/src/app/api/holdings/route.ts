import { NextResponse } from 'next/server'
import { readHoldings, readPortfolioSummary } from '@/lib/excel'

export const dynamic = 'force-dynamic'

export async function GET() {
  const holdings = readHoldings()
  const summary = readPortfolioSummary()

  return NextResponse.json({ holdings, summary })
}
