# Backend–Frontend Integration Summary

This document collects the essential information for connecting the Next.js frontend with the
FastAPI backend, with both optimization and backtesting functionality.

## API Endpoints

### POST `/api/v1/optimize/mvo`

- **Description:** Runs mean‑variance optimization.
- **Request:** same shape as `OptimizationRequest` (ticker & returns map).
- **Response:** `OptimizationResponse` (weights, return, volatility, sharpe).

### POST `/api/v1/backtest/run`

- **Description:** Executes a backtest using provided configuration.
- **Request body:** follows `BacktestConfig`:
  ```json
  {
    "name": "Backtest name",
    "strategies": ["max-sharpe","hrp"],
    "dateRange": {"start":"2022-10-13","end":"2026-03-01"},
    "txCostBps": 10,
    "rebalance": "monthly",
    "maxWeight": 0.4,
    "walkForward": true
  }
  ```
- **Response:** `BacktestRun` metadata (id, status, bestSharpe, etc.).
- **Example:**
  ```bash
  curl -X POST http://localhost:8000/api/v1/backtest/run \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","strategies":["max-sharpe"],"dateRange":{"start":"2022-10-13","end":"2026-03-01"},"txCostBps":10,"rebalance":"monthly","maxWeight":0.4,"walkForward":true}'
  ```

## Frontend Integration

- `src/lib/api.ts` exposes `fetchMVO()` and `fetchBacktest()` functions.
- `src/types/backtest.ts` defines `BacktestConfig` & `BacktestRun` to match backend schemas.
- `ConfigForm` component now accepts an `onSubmit` callback and calls the backend.
- `src/app/backtest/page.tsx` maintains `recentRun` state; passes `handleRun` to form and
  displays the latest run information in the right panel.

## Components Involved

| File | Role |
|------|------|
| `src/components/backtest/ConfigForm.tsx` | Collects parameters, submits to backend |
| `src/app/backtest/page.tsx` | Parent page, stores and shows last run |
| `src/lib/api.ts` | HTTP client for Python service |
| `src/types/backtest.ts` | Shared type definitions |

## Backend Files Added/Changed

- `app/schemas/backtest.py` – Pydantic models for config and run
- `app/services/backtest.py` – stubbed service producing fake results
- `app/api/routes.py` – new `/backtest/run` route

## Usage Flow

1. User fills form and clicks **Run Backtest**.
2. `ConfigForm` passes config to provided `onSubmit` handler.
3. Handler (`handleRun` in page) calls `fetchBacktest`.
4. Backend returns run metadata; page updates `recentRun` state.
5. Right‑hand panel immediately reflects the new run.

> The backend service is currently a placeholder – it returns a completed run with
> random metrics. Replace `BacktestService.run_backtest` with real simulation logic
> when available.

## Environment

- Backend must be running (`python main.py` by default)
- Frontend environment variable `NEXT_PUBLIC_QUANT_API_URL` points to backend

## Testing

- Use the sample curl command above or the front‑end page at `/backtest`.
- The `test_optimizer.py` script remains available for regression on optimizers.

---

Keep this file up to date as you add real backtesting logic or additional endpoints.