import { NextRequest } from 'next/server'
import { fetchReturns } from '@/lib/engine/data'
import { runStrategy } from '@/lib/engine/strategies'
import { computeMetrics, computeTimeSeries } from '@/lib/engine/metrics'
import { cleanReturns } from '@/lib/engine/clean'
import type { StrategyId } from '@/types/backtest'
import { STRATEGY_META } from '@/lib/constants'

const BENCHMARK_TICKER = 'ICLN'

export async function POST(req: NextRequest) {
  const config = await req.json()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // helper to send SSE events
      const emit = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      try {
        const tickers: string[] = config.tickers?.length
          ? config.tickers
          : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'JPM', 'JNJ']

        const strategies: StrategyId[] = config.strategies || []
        if (!strategies.length) {
          emit('error', { detail: 'Select at least one strategy.' })
          controller.close()
          return
        }

        // step 1: fetch price data
        emit('progress', { stage: 'Fetching price data...', pct: 5 })

        let fetchResult
        try {
          fetchResult = await fetchReturns(
            tickers,
            config.dateRange.start,
            config.dateRange.end,
            (msg) => emit('progress', { stage: msg, pct: 10 })
          )
        } catch (e) {
          emit('error', { detail: `Data fetch failed: ${e instanceof Error ? e.message : e}` })
          controller.close()
          return
        }

        const { returns: rawReturns, dates, lastPrices, tickers: validTickers } = fetchResult
        const { data: returns, tickers: cleanTickers } = cleanReturns(rawReturns, validTickers)

        if (returns.length < 2 || cleanTickers.length === 0) {
          emit('error', { detail: 'Not enough data after cleaning. Try different tickers or dates.' })
          controller.close()
          return
        }

        emit('progress', { stage: 'Price data ready', pct: 20 })

        // step 2: run each strategy
        const results: Array<Record<string, unknown>> = []

        for (let i = 0; i < strategies.length; i++) {
          const strategyId = strategies[i]
          const label = STRATEGY_META[strategyId]?.label ?? strategyId
          const pct = 20 + ((i + 1) / strategies.length) * 55
          emit('progress', { stage: `Optimizing ${label}...`, pct: Math.round(pct) })

          try {
            const weights = runStrategy(strategyId, returns, config.maxWeight)
            const metrics = computeMetrics(weights, returns, config.txCostBps)
            const ts = computeTimeSeries(weights, returns, dates.slice(0, returns.length), config.txCostBps)

            // map weights back to ticker names
            const weightMap: Record<string, number> = {}
            for (let j = 0; j < cleanTickers.length; j++) {
              weightMap[cleanTickers[j]] = Math.round(weights[j] * 10000) / 10000
            }

            // filter lastPrices to only clean tickers
            const filteredPrices: Record<string, number> = {}
            for (const t of cleanTickers) {
              if (lastPrices[t] != null) filteredPrices[t] = lastPrices[t]
            }

            results.push({
              strategyId,
              weights: weightMap,
              lastPrices: filteredPrices,
              expectedReturn: metrics.annReturn,
              expectedVolatility: metrics.annVol,
              sharpeRatio: metrics.sharpe,
              maxDD: ts.maxDD,
              calmar: ts.calmar,
              turnover: ts.turnover,
              equityCurve: ts.equityCurve,
              drawdown: ts.drawdown,
              monthlyReturns: ts.monthlyReturns,
            })
          } catch (e) {
            console.error(`Strategy ${strategyId} failed:`, e)
          }
        }

        if (results.length === 0) {
          emit('error', { detail: 'All strategies failed to optimize.' })
          controller.close()
          return
        }

        // step 3: fetch benchmark
        emit('progress', { stage: 'Fetching benchmark (ICLN)...', pct: 80 })

        let benchmarkCurve: Array<{ date: string; value: number }> = []
        try {
          const bench = await fetchReturns(
            [BENCHMARK_TICKER],
            config.dateRange.start,
            config.dateRange.end
          )
          // build equity curve for benchmark
          const benchReturns = bench.returns.map(r => r[0])
          let equity = 100
          benchmarkCurve = bench.dates.map((d, i) => {
            equity *= (1 + benchReturns[i])
            return { date: d, value: Math.round(equity * 10000) / 10000 }
          })
        } catch (e) {
          console.error('Benchmark fetch failed:', e)
        }

        emit('progress', { stage: 'Complete', pct: 100 })

        // build final response
        const bestSharpe = Math.max(...results.map(r => r.sharpeRatio as number))
        const id = crypto.randomUUID()

        const run = {
          id,
          name: config.name || `Backtest ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
          status: 'complete',
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          strategies,
          dateRange: config.dateRange,
          txCost: config.txCostBps,
          rebalance: config.rebalance,
          bestSharpe: Math.round(bestSharpe * 100) / 100,
          results,
          benchmarkCurve,
        }

        emit('result', run)
      } catch (e) {
        emit('error', { detail: e instanceof Error ? e.message : 'Unknown error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
