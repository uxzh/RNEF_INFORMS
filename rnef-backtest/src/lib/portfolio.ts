export const CLEAN_ENERGY_DEFAULTS = [
  'NEE', 'ENPH', 'FSLR', 'SEDG', 'BEP', 'PLUG', 'RUN', 'CSIQ', 'CEG', 'AES',
]

const STORAGE_KEY = 'portfolio_tickers'

export function getPortfolioTickers(): string[] {
  if (typeof window === 'undefined') return CLEAN_ENERGY_DEFAULTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as string[]) : CLEAN_ENERGY_DEFAULTS
  } catch {
    return CLEAN_ENERGY_DEFAULTS
  }
}

export function savePortfolioTickers(tickers: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers))
  } catch {
    // ignore
  }
}
