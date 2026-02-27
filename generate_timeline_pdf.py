"""
Generates RNEF_Dev_Timeline.pdf — Development checklist by team and phase.
Run: python generate_timeline_pdf.py
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "RNEF_Dev_Timeline.pdf"

# ── Color palette ──────────────────────────────────────────────────────────────
NAVY      = colors.HexColor("#002060")
GREEN     = colors.HexColor("#2E8B57")
AMBER     = colors.HexColor("#D97706")
LIGHT_BG  = colors.HexColor("#F0F4F8")
OPT_BLUE  = colors.HexColor("#1D4ED8")
DEV_TEAL  = colors.HexColor("#0F766E")
BOTH_PURPLE = colors.HexColor("#7C3AED")
CHECK_GRAY = colors.HexColor("#6B7280")
WHITE     = colors.white
BLACK     = colors.black

# ── Styles ─────────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title", parent=styles["Title"],
    fontSize=22, textColor=NAVY, spaceAfter=4, alignment=TA_CENTER,
    fontName="Helvetica-Bold"
)
subtitle_style = ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontSize=11, textColor=colors.HexColor("#4B5563"),
    alignment=TA_CENTER, spaceAfter=16
)
phase_style = ParagraphStyle(
    "Phase", parent=styles["Heading1"],
    fontSize=14, textColor=WHITE, spaceAfter=0, spaceBefore=0,
    fontName="Helvetica-Bold", leading=18
)
team_style = ParagraphStyle(
    "Team", parent=styles["Heading2"],
    fontSize=11, textColor=WHITE, spaceAfter=0, spaceBefore=0,
    fontName="Helvetica-Bold", leading=14
)
item_style = ParagraphStyle(
    "Item", parent=styles["Normal"],
    fontSize=9.5, textColor=BLACK, leading=14, leftIndent=6
)
gate_style = ParagraphStyle(
    "Gate", parent=styles["Normal"],
    fontSize=9, textColor=colors.HexColor("#92400E"),
    fontName="Helvetica-Oblique", leading=13
)
note_style = ParagraphStyle(
    "Note", parent=styles["Normal"],
    fontSize=8.5, textColor=CHECK_GRAY, leading=12
)
legend_style = ParagraphStyle(
    "Legend", parent=styles["Normal"],
    fontSize=9, textColor=BLACK, leading=13
)


def checkbox():
    return "☐  "


def phase_header(phase_num, title, gate):
    """Returns a Table row acting as a phase header banner."""
    header_text = Paragraph(
        f"<b>Phase {phase_num}: {title}</b>", phase_style
    )
    gate_text = Paragraph(f"✓ Validation Gate: {gate}", gate_style)

    data = [[header_text], [gate_text]]
    t = Table(data, colWidths=[6.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (0, 0), NAVY),
        ("BACKGROUND",  (0, 1), (0, 1), colors.HexColor("#FEF3C7")),
        ("TOPPADDING",  (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 1, NAVY),
    ]))
    return t


def team_section(label, color, items):
    """Renders a team label + checklist rows as a Table."""
    rows = []

    # Team label row
    team_label = Paragraph(f"<b>{label}</b>", team_style)
    rows.append(([team_label], color))

    # Item rows
    for item in items:
        rows.append(([Paragraph(checkbox() + item, item_style)], WHITE))

    col_w = [6.5 * inch]
    data = [r[0] for r in rows]
    t = Table(data, colWidths=col_w)

    ts = [
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("BACKGROUND",    (0, 0), (0, 0), color),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("LINEBELOW",     (0, 0), (-1, -2), 0.3, colors.HexColor("#E5E7EB")),
    ]
    for i in range(1, len(data)):
        bg = LIGHT_BG if i % 2 == 0 else WHITE
        ts.append(("BACKGROUND", (0, i), (0, i), bg))

    t.setStyle(TableStyle(ts))
    return t


# ── Document data ──────────────────────────────────────────────────────────────

PHASES = [
    {
        "num": 1,
        "title": "Foundation — Data Pipeline + Basic UI",
        "gate": "API returns cumulative return matching Excel within 0.5%; "
                "frontend renders live chart",
        "opt_items": [
            "Set up backend/ directory, FastAPI skeleton, CORS config",
            "Implement core/config.py — fund constants (inception date, tickers, benchmarks)",
            "Implement core/data/loader.py — yfinance fetch + parquet caching",
            "Implement core/data/excel_bridge.py — read NAV, holdings, realized returns (read-only)",
            "Implement core/portfolio/performance.py — total return, annualized return, Sharpe, "
            "Sortino, max drawdown, IRR",
            "Validate performance.py vs Excel: 3.1% total return, +6.3% outperformance vs ICLN",
            "Expose GET /api/portfolio/overview and GET /api/portfolio/historical-nav",
            "Expose GET /api/portfolio/holdings and GET /api/portfolio/realized",
        ],
        "dev_items": [
            "Set up frontend/ — Next.js 14 project, Tailwind CSS, shadcn/ui",
            "Create global layout.tsx with sidebar navigation (5 pages)",
            "Build homepage page.tsx — 4 KPI cards (value, total return, vs ICLN, Sharpe)",
            "Implement lib/api.ts — typed fetch wrappers for all endpoints",
            "Implement lib/types.ts — TypeScript interfaces for all API responses",
            "Build CumulativeReturnsChart.tsx — Recharts line chart, benchmark toggles",
            "Build HoldingsTable.tsx — TanStack Table, conditional color formatting (green/red P&L)",
            "Build PerformanceTable.tsx — 1M/6M/1Y/Inception vs benchmarks + Sharpe + MaxDD",
        ],
    },
    {
        "num": 2,
        "title": "Core Analytics — Risk & Optimization",
        "gate": "Optimization weights sum to 1.0 with no constraint violations; "
                "VaR flags positions exceeding 2% limit in red",
        "opt_items": [
            "Implement core/optimization/mean_variance.py — MVO, max Sharpe, "
            "Ledoit-Wolf covariance shrinkage via PyPortfolioOpt",
            "Implement core/optimization/hrp.py — Hierarchical Risk Parity via Riskfolio-Lib",
            "Implement core/risk/var.py — historical VaR, parametric VaR, CVaR per position "
            "and portfolio (95% and 99% confidence)",
            "Implement core/risk/correlation.py — full correlation matrix + rolling 90-day",
            "Implement core/risk/stress_test.py — 4 historical scenarios "
            "(2022 rate shock, COVID crash, IRA rally, 2024 election)",
            "Expose POST /api/optimize — accepts { tickers, method, constraints }, "
            "returns weights + expected return + volatility + Sharpe",
            "Expose GET /api/optimize/frontier — efficient frontier data points for chart",
            "Expose GET /api/risk/var, /api/risk/correlation, /api/risk/stress-test",
        ],
        "dev_items": [
            "Build EfficientFrontier.tsx — scatter chart marking current portfolio, "
            "Max Sharpe, HRP, Min Volatility points",
            "Build weight comparison grouped bar chart (current vs MVO vs HRP vs Equal Weight)",
            "Build optimization results summary table "
            "(Ann. Return, Volatility, Sharpe, Max Drawdown, Calmar)",
            "Build CorrelationHeatmap.tsx — D3-based color-coded matrix "
            "with rolling period toggle",
            "Build VaRTable.tsx — position-level VaR, flag violations in red",
            "Build stress test bar chart — portfolio loss vs ICLN loss per scenario",
            "Wire Optimization page (/optimization) and Risk Analysis page (/risk) to API",
            "Implement useOptimization.ts and useRisk.ts React Query hooks",
        ],
    },
    {
        "num": 3,
        "title": "Backtesting & Attribution",
        "gate": "Equal-weight backtest starting at inception produces portfolio value "
                "within 5% of actual brokerage NAV on 3 spot-check dates",
        "opt_items": [
            "Implement core/backtesting/engine.py — walk-forward vectorbt engine "
            "(CRITICAL: at each rebalance date, use only prices.loc[:date])",
            "Implement Equal Weight strategy in core/backtesting/strategies.py",
            "Implement Max Sharpe (walk-forward MVO) strategy",
            "Implement HRP (walk-forward) strategy",
            "Implement VaR-Scaled strategy (inverse-volatility, 30% cap per position)",
            "Implement core/portfolio/attribution.py — Brinson allocation + selection effect, "
            "rolling 90-day beta to ICLN",
            "Expose POST /api/backtest — returns equity curve, drawdowns, monthly returns, "
            "summary statistics",
            "Expose GET /api/benchmark/comparison and /api/benchmark/attribution",
        ],
        "dev_items": [
            "Build equity curve multi-line chart overlaying actual RNEF NAV from Excel",
            "Build DrawdownChart.tsx — area chart showing drawdowns per strategy",
            "Build ReturnHeatmap.tsx — monthly return calendar (year × month grid, color by return)",
            "Build backtesting summary statistics table "
            "(Ann. Return, Vol, Sharpe, Max DD, Calmar per strategy)",
            "Build attribution waterfall chart (allocation vs selection vs cash drag)",
            "Build rolling beta line chart (90-day beta to ICLN over time)",
            "Wire Backtesting page (/backtesting) and Benchmark page (/benchmark) to API",
            "Implement usePortfolio.ts hook for portfolio data with caching",
        ],
    },
    {
        "num": 4,
        "title": "Polish, Testing & Deployment",
        "gate": "App accessible via public Vercel URL; all 5 pages load without error",
        "opt_items": [
            "Write unit tests — tests/test_performance.py (validate vs Excel values)",
            "Write unit tests — tests/test_optimization.py (weights sum = 1, bounds check)",
            "Write unit tests — tests/test_var.py (VaR increases with higher confidence)",
            "Add error handling for tickers with <63 days of history (TIC, ULS risk)",
            "Model Schwab MM Fund (SWVXX) as risk-free proxy using FRED TB3MS T-bill rate",
            "Add methodology explanations as docstrings in all core/ modules",
            "Deploy backend to Railway or Render (free tier, configure env vars)",
        ],
        "dev_items": [
            "Implement Excel upload UI — drag-and-drop component → POST /api/data/upload-excel",
            "Add caution warning banners on Optimization and Backtesting pages",
            "Add collapsible accordion methodology explanations on each page (shadcn Accordion)",
            "Add skeleton loaders (shadcn Skeleton) for all async data fetches",
            "Deploy frontend to Vercel (free tier, connect GitHub repo, auto-deploy)",
            "Configure NEXT_PUBLIC_API_URL env variable for production backend URL",
            "End-to-end smoke test: upload Excel → all 5 pages render correct data",
        ],
        "stretch_items": [
            "[STRETCH] Black-Litterman: form inputs for manager return views → blended weights",
            "[STRETCH] Export optimization output to xlsx for copy-paste into Excel tracker",
            "[STRETCH] ICLN holdings auto-fetch from iShares monthly CSV for live overlap analysis",
        ],
    },
]


# ── Build PDF ──────────────────────────────────────────────────────────────────

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    story = []

    # ── Cover block ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        "Rice Renewable Energy Fund", title_style
    ))
    story.append(Paragraph(
        "Analytics Tool — Development Timeline &amp; Task Checklist", subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=10))

    # Legend
    legend_data = [
        [
            Paragraph("■", ParagraphStyle("l", textColor=OPT_BLUE, fontSize=11)),
            Paragraph("<b>Optimization Team</b> — Python analytics core (PyPortfolioOpt, "
                      "Riskfolio-Lib, vectorbt, FastAPI routers)", legend_style),
        ],
        [
            Paragraph("■", ParagraphStyle("l", textColor=DEV_TEAL, fontSize=11)),
            Paragraph("<b>Dev Team</b> — Next.js 14 frontend + FastAPI wiring "
                      "(React, Recharts, TanStack, shadcn/ui)", legend_style),
        ],
        [
            Paragraph("■", ParagraphStyle("l", textColor=BOTH_PURPLE, fontSize=11)),
            Paragraph("<b>Both Teams</b> — Shared deliverables (testing, deployment)",
                      legend_style),
        ],
    ]
    lt = Table(legend_data, colWidths=[0.25 * inch, 6.25 * inch])
    lt.setStyle(TableStyle([
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND",    (0, 0), (-1, -1), LIGHT_BG),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
    ]))
    story.append(lt)
    story.append(Spacer(1, 0.18 * inch))

    # ── Phases ─────────────────────────────────────────────────────────────────
    for phase in PHASES:
        story.append(phase_header(phase["num"], phase["title"], phase["gate"]))
        story.append(Spacer(1, 0.06 * inch))

        story.append(team_section(
            "🔵  Optimization Team",
            OPT_BLUE,
            phase["opt_items"]
        ))
        story.append(Spacer(1, 0.04 * inch))

        story.append(team_section(
            "🟢  Dev Team",
            DEV_TEAL,
            phase["dev_items"]
        ))

        if "stretch_items" in phase:
            story.append(Spacer(1, 0.04 * inch))
            story.append(team_section(
                "🟣  Stretch Goals (Both Teams)",
                BOTH_PURPLE,
                phase["stretch_items"]
            ))

        story.append(Spacer(1, 0.18 * inch))

    # ── Footer note ────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D1D5DB")))
    story.append(Spacer(1, 0.08 * inch))
    story.append(Paragraph(
        "<b>Key Technical Notes:</b>  "
        "(1) Always use Ledoit-Wolf covariance shrinkage for optimization — "
        "raw sample covariance overfits with only 6–10 stocks.  "
        "(2) Walk-forward backtesting: at rebalance date T, use ONLY prices up to T-1.  "
        "(3) Schwab MM (SWVXX) has no yfinance data — proxy with FRED TB3MS T-bill rate.  "
        "(4) Minimum 63 trading days of history before any optimization-based strategy fires.",
        note_style
    ))

    doc.build(story)
    print(f"Created: {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
