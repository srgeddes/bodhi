# Bodhi — Product Spec

## What This Is

A personal finance app with two core differentiators:

1. **AI-generated custom dashboard components** — users describe what they want in plain English and the app builds the widget
2. **AI-powered transaction intelligence** — categorization, transfer detection, and spending analysis powered by an LLM instead of keyword matching

Users connect bank accounts, credit cards, investments, and Venmo through Plaid. The app syncs their data, intelligently categorizes everything, and lets them build a fully custom dashboard to visualize their finances however they want.

---

## Design Direction

Subtle, minimal, and a little artsy. The overall feel should be calm — not the typical loud fintech look. Think:

- Muted, earthy color palette — soft greens, warm grays, off-whites, maybe a clay or sage accent
- Lots of whitespace, nothing cramped
- Thin lines, rounded corners, soft shadows
- Typography-forward — clean sans-serif, generous spacing, type does the heavy lifting over color
- Charts and data visualizations should feel elegant, not corporate — more editorial/infographic than Bloomberg terminal
- Subtle animations — gentle fades, smooth transitions, nothing flashy
- Widgets should feel like physical cards or tiles you're arranging on a surface
- Dark mode should feel cozy, not just "invert the colors" — think warm darks, not pure black
- The vibe is closer to a well-designed journal or art book than a finance app

---

## Features

### 1. Account Connections

Connect and sync all financial accounts through Plaid.

**Supported account types:**

- Checking & savings accounts
- Credit cards
- Investment & brokerage accounts (holdings, transactions, cost basis)
- Retirement accounts (401k, IRA, HSA, 529)
- Venmo (accessible through Plaid as a connected institution)
- Crypto exchanges

**Sync behavior:**

- Automatic overnight updates via webhooks
- Manual refresh on demand
- Last synced timestamp per account
- Handles credential expiration gracefully (prompts user to re-authenticate)

---

### 2. AI Transaction Categorization

Every transaction gets categorized by AI, not keyword matching.

- Assigns category + subcategory from a configurable taxonomy
- Confidence scoring — high/medium/low per transaction
- Low-confidence items flagged for user review in an inbox-style UI
- Learns from user corrections over time (re-categorize once, remembered forever for that merchant)
- Handles ambiguous merchants — "AMZN" could be groceries, electronics, or a subscription; uses amount, frequency, and account context to disambiguate
- Transaction splitting — a single Costco trip can be split across groceries + household + gas
- Merchant name cleanup — turns "DEBIT CARD PURCHASE XXXXX7421 CHIPOTLE MEXICAN 0842" into "Chipotle"

**Category system:**

- ~20 default top-level categories (Housing, Food & Dining, Transportation, Shopping, Entertainment, etc.)
- Subcategories under each (Food & Dining → Groceries, Restaurants, Coffee, Fast Food, Delivery)
- Users can create custom categories and subcategories
- User-defined rules: "always categorize Spotify as Entertainment > Music"

---

### 3. Smart Transfer & Spending Detection

**Transfer detection:**

- Auto-detect matching debits/credits across linked accounts (same amount, ±2 days)
- Transfers excluded from spending calculations
- Credit card payments matched to the specific card they pay off
- Investment contributions recognized as transfers, not spending

**Venmo intelligence:**

- Distinguish between: paying someone back (split), buying goods/services, transferring to/from bank
- "You paid Jake $25" with memo "dinner split" → categorized as Food & Dining, not a transfer
- Venmo-to-bank transfers marked as transfer, not income

**Other detection:**

- Refund matching — nets refunds against original purchases
- Payroll detection — identifies direct deposits as income
- Recurring charge detection — identifies subscriptions and bills automatically
- Duplicate detection — flags potential duplicates from overlapping accounts

---

### 4. AI Dashboard & Widget Builder (Core Differentiator)

Users describe what they want in plain English. The AI builds a working widget.

- Prompt bar at top of dashboard: type what you want to see
- AI generates a visual widget with the right data and chart type
- Widget appears on dashboard, user can drag/resize/reposition
- Iterative refinement: "make it compare to last month" or "only show top 5 categories"

**Example prompts:**

- "Show me how much I spend on food vs last month"
- "Make a chart of my investment allocation by sector"
- "Track my savings rate over the last 6 months"
- "How much am I spending on subscriptions annually?"
- "Compare my income vs expenses for the past year, monthly"
- "Show my net worth broken down by account"

**Dashboard features:**

- Drag-and-drop grid layout
- Resize any widget freely
- Multiple dashboard tabs (e.g. "Overview", "Spending", "Investments", "Goals")
- Save/restore layouts
- AI-suggested widgets — app proactively recommends useful widgets based on your data ("You have 14 subscriptions totaling $287/mo — want a tracker?")

**Natural language queries:**

- Ask questions without building a widget: "How much did I spend on Uber last quarter?"
- Returns a quick answer inline
- Option to pin the answer as a permanent widget

---

### 5. Pre-Built Widget Library

One-click widgets for users who don't want to prompt.

**Spending:**

- Spending by category (pie/donut/bar, configurable time range)
- Monthly spending trend (month over month)
- Income vs expenses
- Budget vs actual by category (progress bars)
- Cash flow calendar (calendar heatmap of money in/out)

**Accounts:**

- Account balances overview (current balance per account)
- Net worth over time (line chart across all accounts)
- Recent transactions (searchable, filterable)

**Investments:**

- Holdings breakdown
- Asset allocation (stocks, bonds, crypto, cash, real estate)
- Portfolio performance vs benchmarks (S&P 500, etc.)
- Dividend income tracking
- Cost basis & unrealized gains/losses
- Tax-lot classification (taxable vs pre-tax vs Roth)

**Bills & Subscriptions:**

- Subscription tracker with monthly and annual totals
- Upcoming bills (next 30 days)
- Savings rate (income minus spending as %)

**Goals:**

- Goal tracker with progress bars
- Custom metric widget (user-defined formula, e.g. "dining out as % of income")

---

### 6. Forecasting & Scenarios

**Projections:**

- Future account balances based on detected recurring income/expenses
- Investment projections with configurable return rates per account type (not one flat rate)
- Savings goal timelines: "at your current rate, you'll hit $X by Y date"

**What-if scenarios:**

- "What if I cancel Netflix, Hulu, and HBO?" → annual spending impact
- "What if I increase my 401k contribution to 15%?" → take-home and retirement projection impact
- "What if I pay an extra $200/mo on my mortgage?" → payoff acceleration
- Side-by-side scenario comparison

---

### 7. AI Insights & Alerts

Proactive intelligence, not just passive dashboards.

- **Monthly financial health summary** — AI-generated narrative of your month: spending trends, notable changes, progress on goals
- **Anomaly detection** — "You spent 3x more on dining out this month compared to your average"
- **Subscription creep alerts** — "Your subscriptions have increased by $45/mo over the past 6 months"
- **Recurring charge changes** — "Netflix just increased from $15.99 to $17.99"
- **Bill negotiation suggestions** — "You're paying $180/mo for internet — the average in your area is $95"

---

### 8. Data Export & Sharing

- Export any widget or full dashboard as PDF or image
- Export transaction data as CSV
- Mobile responsive design

---

## Implementation Phases

**Phase 1 — Foundation:**

- Plaid account connections and transaction sync
- AI categorization pipeline
- Smart transfer detection
- Basic pre-built dashboard with core widgets

**Phase 2 — The Differentiator:**

- AI widget builder (natural language → widget)
- Drag-and-drop dashboard layout
- Multiple dashboard tabs
- Natural language queries

**Phase 3 — Intelligence:**

- Investment tracking
- Forecasting & what-if scenarios
- AI insights & anomaly detection
- AI-suggested widgets

**Phase 4 — Polish:**

- Mobile responsive
- Export/sharing
- Subscription tracking & alerts
- User correction learning loop for categorization
