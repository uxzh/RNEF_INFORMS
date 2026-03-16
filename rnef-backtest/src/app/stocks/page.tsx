import { readHoldings } from '@/lib/excel'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { StockSelector } from '@/components/stocks/StockSelector'

export default async function StocksPage() {
  const holdings = await readHoldings()

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <SectionTitle
        title="Stock Universe"
        subtitle="Select which holdings to include in your backtests."
      />
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <StockSelector holdings={holdings} />
      </div>
    </div>
  )
}
