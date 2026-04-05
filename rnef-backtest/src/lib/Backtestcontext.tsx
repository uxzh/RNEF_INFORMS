'use client'

import { createContext, useContext, useState } from 'react'
import type { BacktestRun } from '@/types/backtest'

interface BacktestContextValue {
  runs: BacktestRun[]
  addRun: (run: BacktestRun) => void
}

const BacktestContext = createContext<BacktestContextValue | null>(null)

export function BacktestProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<BacktestRun[]>([])
  const addRun = (run: BacktestRun) => setRuns(prev => [run, ...prev])

  return (
    <BacktestContext.Provider value={{ runs, addRun }}>
      {children}
    </BacktestContext.Provider>
  )
}

export function useBacktest() {
  const ctx = useContext(BacktestContext)
  if (!ctx) throw new Error('useBacktest must be used within BacktestProvider')
  return ctx
}