import { ConfigForm } from '@/components/backtest/ConfigForm'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { MOCK_BACKTEST_RUNS } from '@/lib/mock-data'
import { STRATEGY_META } from '@/lib/constants'

export default function NewBacktestPage() {
  const recentRun = MOCK_BACKTEST_RUNS[0]

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-[1fr_320px] gap-8">
      {/* Left: Form */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <SectionTitle
          title="Configure Backtest"
          sub="Set parameters and select strategies to simulate"
          className="mb-6"
        />
        <ConfigForm />
      </div>

      {/* Right: Info panel */}
      <div className="space-y-4">
        {/* Strategy Guide */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <SectionTitle title="Strategy Guide" className="mb-4" />
          <div className="space-y-3">
            {Object.values(STRATEGY_META)
              .filter(m => m.id !== 'rnef-actual')
              .map(meta => (
                <div key={meta.id} className="flex items-start gap-2.5">
                  <span
                    className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <div>
                    <p className="text-[12px] font-semibold text-[#1E293B]">{meta.label}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {meta.id === 'max-sharpe'   && 'Mean-variance optimization with Ledoit-Wolf covariance shrinkage.'}
                      {meta.id === 'min-vol'       && 'Global minimum variance — focuses on reducing portfolio volatility.'}
                      {meta.id === 'hrp'           && 'Hierarchical Risk Parity — no matrix inversion, robust to estimation error.'}
                      {meta.id === 'var-scaled'    && 'Position sizes inversely proportional to 95% historical VaR.'}
                      {meta.id === 'equal-weight'  && 'Naive 1/N benchmark — equal allocation across all assets.'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Last Run Summary */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <SectionTitle title="Last Run" sub={recentRun.createdAt} className="mb-3" />
          <p className="text-[12px] font-semibold text-[#1E293B]">{recentRun.name}</p>
          <p className="mt-1 text-[11px] text-[#64748B]">
            {recentRun.strategies.length} strategies · {recentRun.rebalance} · {recentRun.txCost}bps
          </p>
          {recentRun.bestSharpe && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#2E8B57]">
              Best Sharpe: {recentRun.bestSharpe.toFixed(2)}
            </p>
          )}
        </div>

        {/* Data note */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-[11px] font-semibold text-[#1E293B]">Data Sources</p>
          <ul className="mt-1.5 space-y-1 text-[11px] text-[#64748B]">
            <li>· Price data via yfinance</li>
            <li>· Risk-free rate via FRED TB3MS</li>
            <li>· Holdings from Excel tracker</li>
            <li>· Inception: Oct 13, 2022</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
