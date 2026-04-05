// Historical returns: ticker -> array of returns
export interface OptimizationRequest {
  data: Record<string, number[]>;
}

// Optimized portfolio results from backend
export interface OptimizationResponse {
  weights: Record<string, number>;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

// Error response from backend
export interface OptimizationError {
  error: string;
}