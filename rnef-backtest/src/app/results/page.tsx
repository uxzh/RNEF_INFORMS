import Link from 'next/link'
import { BarChart3, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ResultsIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
        <BarChart3 size={24} className="text-[#94A3B8]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-4 text-[15px] font-semibold text-[#1E293B]">No results yet</h2>
      <p className="mt-1.5 max-w-xs text-[12.5px] text-[#64748B]">
        Run your first backtest to see equity curves, drawdown analysis, and strategy statistics here.
      </p>
      <Link href="/backtest" className="mt-6">
        <Button className="bg-[#002060] text-white hover:bg-[#003087]">
          <Play size={13} className="mr-2" />
          Run a Backtest
        </Button>
      </Link>
    </div>
  )
}
