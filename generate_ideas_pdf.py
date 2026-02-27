"""
Generates RNEF_Fund_Ideas.pdf — Overview of tool ideas and analytical approaches
for the Rice Renewable Energy Fund.
Run: python generate_ideas_pdf.py
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUTPUT = "RNEF_Fund_Ideas.pdf"

# ── Color palette ──────────────────────────────────────────────────────────────
NAVY        = colors.HexColor("#002060")
GREEN       = colors.HexColor("#2E8B57")
AMBER       = colors.HexColor("#D97706")
LIGHT_BG    = colors.HexColor("#F0F4F8")
AMBER_BG    = colors.HexColor("#FFFBEB")
GREEN_BG    = colors.HexColor("#ECFDF5")
RED_BG      = colors.HexColor("#FEF2F2")
BLUE_BG     = colors.HexColor("#EFF6FF")
PURPLE_BG   = colors.HexColor("#F5F3FF")
TEAL_BG     = colors.HexColor("#F0FDFA")
GRAY        = colors.HexColor("#6B7280")
WHITE       = colors.white
BLACK       = colors.black

# ── Styles ─────────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title", parent=styles["Title"],
    fontSize=22, textColor=NAVY, spaceAfter=4, alignment=TA_CENTER,
    fontName="Helvetica-Bold"
)
subtitle_style = ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontSize=11, textColor=GRAY, alignment=TA_CENTER, spaceAfter=14
)
section_style = ParagraphStyle(
    "Section", parent=styles["Heading1"],
    fontSize=13, textColor=WHITE, spaceAfter=0, spaceBefore=0,
    fontName="Helvetica-Bold", leading=18
)
idea_title_style = ParagraphStyle(
    "IdeaTitle", parent=styles["Heading2"],
    fontSize=11, textColor=NAVY, spaceAfter=2, spaceBefore=6,
    fontName="Helvetica-Bold"
)
body_style = ParagraphStyle(
    "Body", parent=styles["Normal"],
    fontSize=9.5, textColor=BLACK, leading=14, spaceAfter=4,
    alignment=TA_JUSTIFY
)
bullet_style = ParagraphStyle(
    "Bullet", parent=styles["Normal"],
    fontSize=9.5, textColor=BLACK, leading=13, leftIndent=14
)
tag_style = ParagraphStyle(
    "Tag", parent=styles["Normal"],
    fontSize=8, textColor=GRAY, leading=11
)
feasibility_style = ParagraphStyle(
    "Feasibility", parent=styles["Normal"],
    fontSize=8.5, textColor=colors.HexColor("#065F46"),
    fontName="Helvetica-Bold", leading=11
)
note_style = ParagraphStyle(
    "Note", parent=styles["Normal"],
    fontSize=8.5, textColor=GRAY, leading=12
)


def section_header(title, color=NAVY):
    p = Paragraph(f"  {title}", section_style)
    t = Table([[p]], colWidths=[6.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), color),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("BOX",           (0, 0), (-1, -1), 0.5, color),
    ]))
    return t


def idea_card(title, description, bullets, feasibility, tags, bg_color=LIGHT_BG):
    """Render one idea as a card-style table row."""
    content = []
    content.append(Paragraph(f"<b>{title}</b>", idea_title_style))
    content.append(Paragraph(description, body_style))
    for b in bullets:
        content.append(Paragraph(f"→  {b}", bullet_style))
    content.append(Spacer(1, 4))
    content.append(Paragraph(f"<b>Feasibility:</b> {feasibility}", feasibility_style))
    content.append(Paragraph(f"Tags: {tags}", tag_style))

    inner = Table([[p] for p in content], colWidths=[6.1 * inch])
    inner.setStyle(TableStyle([
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
    ]))

    outer = Table([[inner]], colWidths=[6.5 * inch])
    outer.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), bg_color),
        ("BOX",           (0, 0), (-1, -1), 0.7, colors.HexColor("#D1D5DB")),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return KeepTogether([outer, Spacer(1, 0.1 * inch)])


# ── Content ────────────────────────────────────────────────────────────────────

SECTIONS = [
    {
        "title": "1. Portfolio Optimization",
        "color": colors.HexColor("#1D4ED8"),
        "ideas": [
            {
                "title": "Mean-Variance Optimization (MVO) — Efficient Frontier",
                "description": (
                    "Classical Markowitz portfolio theory: find the allocation that maximizes "
                    "expected return per unit of risk. Applied to RNEF's current holdings and "
                    "a broader clean energy universe, this produces an 'efficient frontier' "
                    "showing the optimal risk-return tradeoffs available."
                ),
                "bullets": [
                    "Max Sharpe: highest risk-adjusted return given historical covariances",
                    "Min Volatility: lowest risk portfolio on the frontier",
                    "Ledoit-Wolf covariance shrinkage (prevents overfitting with small portfolios)",
                    "Interactive efficient frontier chart — current RNEF portfolio marked on chart",
                    "Weight comparison: current weights vs optimal suggested weights",
                ],
                "feasibility": "High — PyPortfolioOpt library, ~1–2 weeks to implement",
                "tags": "MVO, Sharpe Ratio, Efficient Frontier, Ledoit-Wolf",
                "bg": BLUE_BG,
            },
            {
                "title": "Hierarchical Risk Parity (HRP)",
                "description": (
                    "A more robust alternative to MVO for small portfolios. HRP uses "
                    "hierarchical clustering to group correlated assets, then allocates "
                    "inversely proportional to risk within each cluster. Unlike MVO, it does "
                    "NOT invert the covariance matrix, making it numerically stable with "
                    "RNEF's 6–10 stock portfolio."
                ),
                "bullets": [
                    "More stable than MVO when fewer than 30–50 assets are held",
                    "Produces a dendrogram visualization of asset clustering",
                    "Better out-of-sample performance than MVO in academic literature",
                    "Implemented via Riskfolio-Lib; present alongside MVO for comparison",
                ],
                "feasibility": "High — Riskfolio-Lib library, ~1 week to implement",
                "tags": "HRP, Risk Parity, Clustering, Riskfolio-Lib",
                "bg": BLUE_BG,
            },
            {
                "title": "Black-Litterman Model (Stretch Goal)",
                "description": (
                    "Blends market equilibrium (CAPM implied returns) with the fund managers' "
                    "own views on individual stocks. If RNEF analysts believe BWXT will "
                    "outperform by 15%, Black-Litterman mathematically incorporates that view "
                    "into the optimization with appropriate uncertainty weighting."
                ),
                "bullets": [
                    "Fund managers input their views (ticker, direction, confidence)",
                    "Views blended with CAPM equilibrium returns via Bayesian update",
                    "Produces view-tilted optimal weights respecting market structure",
                    "Directly bridges fundamental analysis with quantitative optimization",
                ],
                "feasibility": "Medium — PyPortfolioOpt has BL support; 2–3 weeks",
                "tags": "Black-Litterman, CAPM, Bayesian, Views",
                "bg": BLUE_BG,
            },
        ],
    },
    {
        "title": "2. Risk Management Tools",
        "color": colors.HexColor("#DC2626"),
        "ideas": [
            {
                "title": "Value at Risk (VaR) & CVaR Dashboard",
                "description": (
                    "Replaces the broken Position Sizing sheet in the Excel tracker (which "
                    "fails outside FactSet). Computes per-position and portfolio-level VaR "
                    "using both historical simulation and parametric methods. Flags any "
                    "position that exceeds the fund's 2% VaR constraint in real time."
                ),
                "bullets": [
                    "Historical VaR: uses actual return distribution (no normality assumption)",
                    "Parametric VaR: Gaussian model, faster to compute for scenario analysis",
                    "CVaR / Expected Shortfall: average loss beyond the VaR threshold — "
                    "superior metric for tail risk",
                    "Per-position contribution table; red highlight on 2% limit violations",
                    "Portfolio-level 1-day and 10-day VaR at 95% and 99% confidence",
                ],
                "feasibility": "High — scipy/numpy only, ~1 week to implement",
                "tags": "VaR, CVaR, Expected Shortfall, Risk Constraints",
                "bg": RED_BG,
            },
            {
                "title": "Correlation Matrix & Diversification Monitor",
                "description": (
                    "Visualizes how correlated RNEF's holdings are with each other and with "
                    "ICLN. High correlations mean diversification is illusory — during market "
                    "stress, all assets tend to move together. A rolling 90-day view shows how "
                    "correlations change through time."
                ),
                "bullets": [
                    "Interactive color-coded heatmap of pairwise correlations",
                    "Rolling 90-day correlation vs full-period correlation comparison",
                    "Alerts when a pair of holdings exceeds 0.85 correlation (low diversification)",
                    "Correlation to ICLN benchmark (how benchmark-like is the portfolio?)",
                ],
                "feasibility": "High — pandas + D3/Recharts heatmap, ~1 week",
                "tags": "Correlation, Diversification, Rolling Analysis",
                "bg": RED_BG,
            },
            {
                "title": "Historical Stress Testing",
                "description": (
                    "Applies historically observed market shocks to the current portfolio "
                    "composition to estimate potential losses. Critical for a clean energy "
                    "fund because policy-driven events (IRA, election results, rate hikes) "
                    "cause extreme moves in the sector."
                ),
                "bullets": [
                    "2022 Rate Shock: Fed hike cycle — ICLN fell 48% (fund inception context)",
                    "2020 COVID Crash: S&P 500 fell 34% in 28 days",
                    "IRA Passage Rally (Aug 2022): clean energy surged 30%+",
                    "2024 Election Selloff: ICLN fell ~10% in 3 days",
                    "Bar chart comparing portfolio loss vs ICLN loss per scenario",
                ],
                "feasibility": "High — historical prices from yfinance, ~1 week",
                "tags": "Stress Testing, Scenario Analysis, Tail Risk",
                "bg": RED_BG,
            },
            {
                "title": "Stop-Loss Monitor",
                "description": (
                    "Tracks current prices against the stop-loss levels defined in the Excel "
                    "tracker and alerts when positions approach or breach their triggers. "
                    "Provides a live dashboard the fund can check daily without opening the "
                    "Excel file."
                ),
                "bullets": [
                    "Reads stop-loss prices from Excel bridge (Holdings sheet)",
                    "Computes distance to stop as a percentage for each holding",
                    "Color-code: green (>20% away), amber (10–20%), red (<10%)",
                    "Shows days held alongside stop distance for context",
                ],
                "feasibility": "High — yfinance + Excel bridge, ~3 days",
                "tags": "Stop-Loss, Risk Monitoring, Alerts",
                "bg": RED_BG,
            },
        ],
    },
    {
        "title": "3. Backtesting & Strategy Comparison",
        "color": colors.HexColor("#0F766E"),
        "ideas": [
            {
                "title": "Walk-Forward Strategy Backtesting",
                "description": (
                    "Simulates how different weighting strategies would have performed from "
                    "RNEF's inception (Oct 13, 2022) through today, using only data available "
                    "at each rebalancing date (no look-ahead bias). Answers the key question: "
                    "'Would a systematic strategy have beaten our actual returns?'"
                ),
                "bullets": [
                    "Equal Weight (1/N): baseline; no optimization, maximum simplicity",
                    "Max Sharpe (walk-forward MVO): re-optimize monthly with rolling window",
                    "Hierarchical Risk Parity (walk-forward): cluster-based risk allocation",
                    "VaR-Scaled: larger weights to lower-volatility stocks, matching Excel logic",
                    "Equity curves, drawdown chart, monthly return heatmap, summary statistics",
                    "Overlay actual RNEF NAV from brokerage statements for direct comparison",
                ],
                "feasibility": "Medium — vectorbt engine, ~2–3 weeks",
                "tags": "Backtesting, Walk-Forward, Rebalancing, vectorbt",
                "bg": TEAL_BG,
            },
            {
                "title": "Rebalancing Frequency Analysis",
                "description": (
                    "Tests how often the portfolio should be rebalanced. More frequent "
                    "rebalancing captures drift faster but incurs higher transaction costs. "
                    "Less frequent rebalancing drifts from target weights. The optimal "
                    "frequency depends on portfolio volatility and transaction cost assumptions."
                ),
                "bullets": [
                    "Compare: monthly vs quarterly vs semi-annual rebalancing",
                    "Transaction cost sensitivity slider (0 to 50 basis points per trade)",
                    "Shows turnover rate for each frequency",
                    "Net-of-cost Sharpe ratio comparison table",
                ],
                "feasibility": "Medium — extension of backtesting engine, ~1 week additional",
                "tags": "Rebalancing, Transaction Costs, Turnover",
                "bg": TEAL_BG,
            },
        ],
    },
    {
        "title": "4. Benchmark Analysis & Attribution",
        "color": colors.HexColor("#7C3AED"),
        "ideas": [
            {
                "title": "ICLN Overlap & Methodology Comparison",
                "description": (
                    "The S&P Global Clean Energy Index (tracked by ICLN) is RNEF's primary "
                    "benchmark. This module shows how RNEF's holdings overlap with ICLN's "
                    "100+ global components, what sectors RNEF is overweight vs the index, "
                    "and how the rolling beta to ICLN has evolved over time."
                ),
                "bullets": [
                    "Holdings overlap: which RNEF stocks are in ICLN? What percentage?",
                    "Sector breakdown comparison: RNEF vs ICLN (electric utilities, clean tech…)",
                    "Rolling 90-day beta to ICLN — shows when RNEF tracks vs diverges",
                    "Geographic breakdown comparison (ICLN is 39% US; RNEF is 100% US)",
                ],
                "feasibility": "Medium — ICLN composition from iShares CSV, ~1–2 weeks",
                "tags": "ICLN, Benchmark, Beta, Overlap Analysis",
                "bg": PURPLE_BG,
            },
            {
                "title": "Brinson Performance Attribution",
                "description": (
                    "Decomposes the fund's excess return vs ICLN into two components: "
                    "(1) Allocation Effect — did holding more or less of the right sectors help? "
                    "(2) Selection Effect — did picking the right stocks within sectors help? "
                    "This makes visible the key insight: RNEF's outperformance comes almost "
                    "entirely from holding cash, not from stock picking skill."
                ),
                "bullets": [
                    "Waterfall chart: allocation effect + selection effect = total active return",
                    "Attribution per sector over the full period since inception",
                    "Rolling 6-month attribution to show consistency",
                    "Cash drag contribution quantified separately",
                ],
                "feasibility": "Medium — requires ICLN sector weights data, ~2 weeks",
                "tags": "Attribution, Brinson, Active Return, Alpha",
                "bg": PURPLE_BG,
            },
            {
                "title": "Fama-French Factor Exposure",
                "description": (
                    "Regresses RNEF's returns on Fama-French 3-factor model (market risk, "
                    "size, value) to decompose performance. Shows how much of RNEF's return "
                    "is explained by broad market exposure vs genuine alpha, and whether RNEF "
                    "has a systematic tilt toward small-cap or value/growth stocks."
                ),
                "bullets": [
                    "Market Beta (Rm-Rf): how much market risk does RNEF take?",
                    "SMB (Small-Minus-Big): does RNEF tilt toward small caps?",
                    "HML (High-Minus-Low): value or growth tilt?",
                    "Alpha: risk-adjusted excess return not explained by factors",
                    "Compare factor loadings of RNEF vs ICLN",
                ],
                "feasibility": "Medium — Fama-French factors from Ken French data library, ~2 weeks",
                "tags": "Factor Model, Fama-French, Alpha, Beta",
                "bg": PURPLE_BG,
            },
        ],
    },
    {
        "title": "5. Reporting & Workflow Integration",
        "color": colors.HexColor("#92400E"),
        "ideas": [
            {
                "title": "Interactive Investor Report Dashboard",
                "description": (
                    "Replicates and enhances the Excel 'Investor Output' sheet with an "
                    "interactive web dashboard the fund can share. Fund managers can export "
                    "a snapshot PDF for LP communications, matching the professional format "
                    "of the existing Excel output."
                ),
                "bullets": [
                    "Performance scorecard: 1M/6M/1Y/Inception vs all benchmarks",
                    "Portfolio composition pie chart with current vs target weights",
                    "Top holdings table with current return and target prices",
                    "One-click PDF export for LP communications",
                ],
                "feasibility": "Medium — Next.js + jsPDF or server-side PDF, ~2 weeks",
                "tags": "Reporting, Investor Output, LP Communications",
                "bg": AMBER_BG,
            },
            {
                "title": "Excel Bridge — Seamless Data Integration",
                "description": (
                    "Fund managers continue using the Excel tracker exactly as before. The "
                    "web tool reads the Excel file (read-only via openpyxl) to pull in the "
                    "fund's actual brokerage-reported NAV and positions, ensuring the tool "
                    "stays grounded in reality rather than approximating from yfinance prices."
                ),
                "bullets": [
                    "Drag-and-drop Excel upload in the web UI",
                    "Reads actual brokerage NAV from Historical Returns sheet",
                    "Reads current positions, entry dates, stop-losses from Holdings sheet",
                    "Exports optimization suggestions as xlsx for copy-paste back into Excel",
                ],
                "feasibility": "High — openpyxl, ~3–5 days",
                "tags": "Excel Integration, openpyxl, Workflow",
                "bg": AMBER_BG,
            },
            {
                "title": "Position Sizing Calculator (Replaces Broken Excel Sheet)",
                "description": (
                    "The Excel's Position Sizing sheet shows #NAME? errors outside FactSet. "
                    "The web tool reimplements all four sizing schemes: Equal Weight, "
                    "Equal Size, VaR-Scaled, and Volatility-Scaled — fully functional "
                    "using yfinance data instead of FactSet."
                ),
                "bullets": [
                    "Given portfolio value and target positions, computes dollar allocation",
                    "VaR-Scaled: assigns larger weights to lower-volatility stocks",
                    "Volatility-Scaled (inverse volatility): same concept, simpler math",
                    "Shows max shares allowed per position under the 2% VaR constraint",
                    "Output table formatted to match Excel's Position Sizing layout",
                ],
                "feasibility": "High — extension of VaR module, ~1 week",
                "tags": "Position Sizing, VaR Constraint, Kelly Criterion",
                "bg": AMBER_BG,
            },
        ],
    },
    {
        "title": "6. Advanced / Stretch Ideas",
        "color": GRAY,
        "ideas": [
            {
                "title": "Clean Energy Universe Screener",
                "description": (
                    "A screener that filters a universe of 50+ clean energy stocks by "
                    "quantitative criteria: momentum, volatility, market cap, and proximity "
                    "to 52-week high. Gives the fund a data-driven starting point for "
                    "fundamental research on new position candidates."
                ),
                "bullets": [
                    "Universe: ICLN components + additional pure-play clean energy names",
                    "Filter by: 6-month momentum, 52-week high %, 1-year volatility, market cap",
                    "Sort by composite score; export to xlsx for further research",
                    "ICLN inclusion flag (shows which screened stocks are benchmark constituents)",
                ],
                "feasibility": "Medium — yfinance + pandas filtering, ~1–2 weeks",
                "tags": "Screener, Momentum, Clean Energy Universe, Factor Scoring",
                "bg": LIGHT_BG,
            },
            {
                "title": "Natural Language Query Interface",
                "description": (
                    "Allow fund managers to ask questions in plain English: 'What is our "
                    "current VaR at 99% confidence?' or 'How would BWXT at 25% weight affect "
                    "our Sharpe ratio?' The tool translates the question into API calls and "
                    "returns a structured answer."
                ),
                "bullets": [
                    "Powered by a language model API (Anthropic Claude)",
                    "Queries mapped to existing API endpoints",
                    "Returns structured data + natural language explanation",
                    "Useful for non-technical fund members to access analytics",
                ],
                "feasibility": "Low-Medium — requires LLM API integration, 3+ weeks",
                "tags": "LLM, Natural Language, AI Interface",
                "bg": LIGHT_BG,
            },
            {
                "title": "Monte Carlo Simulation for Portfolio Outcomes",
                "description": (
                    "Runs thousands of simulated future portfolio paths based on historical "
                    "return distribution, showing the range of outcomes at 1-year, 3-year, "
                    "and 5-year horizons. Useful for LP reporting to show risk bands around "
                    "expected returns."
                ),
                "bullets": [
                    "10,000 simulated paths using bootstrapped historical returns",
                    "Fan chart showing 10th/25th/50th/75th/90th percentile outcomes",
                    "Probability of exceeding ICLN benchmark at each horizon",
                    "Sensitivity to starting cash allocation (44% cash drag analysis)",
                ],
                "feasibility": "Medium — numpy random sampling, ~1–2 weeks",
                "tags": "Monte Carlo, Simulation, Scenario Analysis",
                "bg": LIGHT_BG,
            },
        ],
    },
]


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

    # ── Cover ──────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Rice Renewable Energy Fund", title_style))
    story.append(Paragraph(
        "Analytics Tool — Ideas &amp; Capabilities Overview", subtitle_style
    ))
    story.append(Paragraph(
        "A student-built quantitative platform to support fund decision-making. "
        "Each idea below is a discrete module the team can build; all are designed "
        "to complement (not replace) the fund managers' judgment and the existing "
        "Excel-based workflow.",
        ParagraphStyle("intro", parent=styles["Normal"], fontSize=10,
                       textColor=GRAY, leading=15, alignment=TA_JUSTIFY,
                       spaceAfter=10)
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=14))

    # ── Sections ───────────────────────────────────────────────────────────────
    for section in SECTIONS:
        story.append(section_header(section["title"], section["color"]))
        story.append(Spacer(1, 0.08 * inch))

        for idea in section["ideas"]:
            story.append(idea_card(
                title=idea["title"],
                description=idea["description"],
                bullets=idea["bullets"],
                feasibility=idea["feasibility"],
                tags=idea["tags"],
                bg_color=idea["bg"],
            ))

        story.append(Spacer(1, 0.06 * inch))

    # ── Summary table ──────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1.5, color=NAVY, spaceAfter=8))
    story.append(Paragraph("<b>Implementation Priority Summary</b>",
                           ParagraphStyle("h", parent=styles["Heading1"],
                                          fontSize=12, textColor=NAVY, spaceAfter=6)))

    rows = [
        [Paragraph("<b>Module</b>", bullet_style),
         Paragraph("<b>Priority</b>", bullet_style),
         Paragraph("<b>Owner</b>", bullet_style),
         Paragraph("<b>Effort</b>", bullet_style)],
        ["VaR / CVaR Dashboard",         "★★★ Core",     "Optimization", "1 week"],
        ["MVO / HRP Optimization",        "★★★ Core",     "Optimization", "2 weeks"],
        ["Walk-Forward Backtesting",      "★★★ Core",     "Optimization", "2–3 weeks"],
        ["Portfolio Overview Dashboard",  "★★★ Core",     "Dev",          "2 weeks"],
        ["Stress Testing Scenarios",      "★★★ Core",     "Optimization", "1 week"],
        ["Excel Bridge Integration",      "★★★ Core",     "Dev",          "3–5 days"],
        ["Correlation Matrix",            "★★☆ High",     "Optimization", "1 week"],
        ["Brinson Attribution",           "★★☆ High",     "Optimization", "2 weeks"],
        ["ICLN Overlap / Beta",           "★★☆ High",     "Dev",          "1–2 weeks"],
        ["Position Sizing Calculator",    "★★☆ High",     "Dev",          "1 week"],
        ["Fama-French Factor Model",      "★☆☆ Stretch",  "Optimization", "2 weeks"],
        ["Black-Litterman Model",         "★☆☆ Stretch",  "Optimization", "2–3 weeks"],
        ["Clean Energy Screener",         "★☆☆ Stretch",  "Dev",          "1–2 weeks"],
        ["Monte Carlo Simulation",        "★☆☆ Stretch",  "Either",       "1–2 weeks"],
        ["Natural Language Interface",    "★☆☆ Stretch",  "Dev",          "3+ weeks"],
    ]

    row_data = [[rows[0]]]
    for r in rows[1:]:
        row_data.append([
            Paragraph(r[0], bullet_style),
            Paragraph(r[1], bullet_style),
            Paragraph(r[2], bullet_style),
            Paragraph(r[3], bullet_style),
        ])

    col_widths = [2.9 * inch, 1.0 * inch, 1.2 * inch, 1.4 * inch]
    t = Table(row_data, colWidths=col_widths, repeatRows=1)

    ts = [
        ("BACKGROUND",    (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("BOX",           (0, 0), (-1, -1), 0.5, NAVY),
        ("INNERGRID",     (0, 0), (-1, -1), 0.3, colors.HexColor("#D1D5DB")),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
    ]
    # Color priority column
    for i, r in enumerate(rows[1:], start=1):
        if "★★★" in r[1]:
            ts.append(("TEXTCOLOR", (1, i), (1, i), GREEN))
        elif "★★☆" in r[1]:
            ts.append(("TEXTCOLOR", (1, i), (1, i), AMBER))
        else:
            ts.append(("TEXTCOLOR", (1, i), (1, i), GRAY))

    t.setStyle(TableStyle(ts))
    story.append(t)
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        "All 'Core' modules are planned for the primary semester deliverable. "
        "'Stretch' modules are optional enhancements if time permits. "
        "The tool is read-only with respect to the fund's Excel tracker — "
        "it never writes to or modifies the brokerage data.",
        note_style
    ))

    doc.build(story)
    print(f"Created: {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
