# RNEF Analytics — Backtesting Dashboard

[This is the frontend](https://rnef-informs.vercel.app) (the visual website part) of the Rice Renewable Energy Fund analytics tool. It lets the fund team run **backtests** — simulations that test how different investing strategies would have performed in the past using the fund's real stock holdings.

> **For new contributors:** You do not need to understand all the code to get started. Just follow the steps below to run the website on your computer.

---

## How to Run It

You need **Node.js** installed. If you don't have it, download it from [nodejs.org](https://nodejs.org).

**Step 1** — Open a terminal and go to this folder:
```
cd C:\Programs\RNEF\rnef-backtest
```

**Step 2** — Install the project's dependencies (only needed the first time):
```
npm install
```

**Step 3** — Start the website:
```
npm run dev
```

**Step 4** — Open your browser and go to:
```
http://localhost:3000
```

To stop the server, press `Ctrl + C` in the terminal.

---

## What You'll See

The [website](https://rnef-informs.vercel.app) has four pages, accessible from the left sidebar:

| Page | What it does |
|---|---|
| **Dashboard** | Shows the fund's current stock holdings (read from the Excel file) and portfolio health metrics |
| **New Backtest** | A form where you choose strategies and settings, then click "Run Backtest" (backend not connected yet) |
| **Results** | Will show charts and statistics from a completed backtest — equity curves, drawdown, monthly returns |
| **Strategy Library** | Will show saved strategies once the backend is connected |

Pages that say "No results yet" or show grey placeholder boxes are **not broken** — they are waiting for the Python backend to be built and connected.

---

## Folder Structure

Everything important lives inside the `src/` folder:

```
src/
│
├── app/                    ← Pages of the website (one folder = one page)
│   ├── page.tsx            ← Dashboard (the home page)
│   ├── backtest/           ← "New Backtest" page
│   ├── results/            ← Results pages
│   ├── strategies/         ← Strategy Library page
│   └── api/holdings/       ← A small server endpoint that reads the Excel file
│
├── components/             ← Reusable building blocks (buttons, cards, charts, etc.)
│   ├── layout/             ← The sidebar and top bar that appear on every page
│   ├── shared/             ← Small pieces used everywhere (metric cards, badges, banners)
│   ├── charts/             ← Chart components (equity curve, drawdown, returns heatmap)
│   ├── holdings/           ← The stock holdings table
│   ├── backtest/           ← Backtest-specific components (config form, results table)
│   └── ui/                 ← Auto-generated design components (do not edit these)
│
├── lib/                    ← Helper code and data
│   ├── excel.ts            ← Reads the Excel file and returns the fund's holdings
│   ├── mock-data.ts        ← Placeholder data used when no real data is available
│   ├── constants.ts        ← Shared values (strategy colors, fund inception date)
│   └── utils.ts            ← Small utility functions
│
└── types/                  ← Definitions of data shapes (what a "Holding" looks like, etc.)
    ├── holdings.ts         ← Types for stock positions and portfolio summary
    └── backtest.ts         ← Types for strategies, backtest runs, and results
```

### Simple rule of thumb
- Want to **change what a page looks like**? Edit a file in `app/`
- Want to **change a reusable piece** (a card, a chart)? Edit a file in `components/`
- Want to **change data or add a new constant**? Edit a file in `lib/`

---

## The Excel File

The dashboard reads live data from:
```
C:\Programs\RNEF\Master Portfolio Tracker vExternal.xlsx
```

If the file can't be found, the site automatically falls back to the sample data in `src/lib/mock-data.ts` so the site still loads. No error will appear — it just uses the placeholder numbers.

---

## Tech Stack

| Tool | What it is |
|---|---|
| **Next.js** | The framework that runs the website |
| **React** | The library used to build the pages and components |
| **TypeScript** | JavaScript but with stricter rules — helps catch mistakes early |
| **Tailwind CSS** | A way to style things by adding class names directly in the code |
| **shadcn/ui** | A set of pre-built, nicely designed components (buttons, inputs, etc.) |
| **Recharts** | The library used to draw charts |

---

## What's Not Built Yet

The following features show placeholder ("skeleton") states and will be filled in once a Python backend is connected:

- Running an actual backtest
- Viewing real backtest results
- Saving and loading strategies

These components are already designed and waiting in `src/components/` — they just need real data from the backend.
