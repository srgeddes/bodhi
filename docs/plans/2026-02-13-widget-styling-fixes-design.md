# Widget Styling Fixes - Design Document

## Problem

Most dashboard widgets have inconsistent colors, spacing, and typography. The Income vs Expenses widget uses orange (clay) for expense bars, which contradicts the app's semantic color conventions. Multiple widgets mix different color systems (`text-destructive` vs `var(--error-text)` vs `var(--primary)`), use inconsistent gap values, and have typography mismatches.

## Design Decisions

### Semantic Chart Colors

Add two new CSS variables for chart fills where income/expense semantics apply:

- `--chart-income`: Muted green at chart-appropriate brightness (hue 145, matching sage palette)
- `--chart-expense`: Muted rose at chart-appropriate brightness (hue 15, NOT orange hue 50)

These sit alongside the existing `--chart-1` through `--chart-7` palette. The earthy palette is for multi-category/multi-series charts. The semantic pair is for income/expense and inflow/outflow charts.

### Color System Standardization

All widgets use exactly two patterns for positive/negative values:
- **Text**: `text-[var(--success-text)]` / `text-[var(--error-text)]`
- **Chart fills**: `var(--chart-income)` / `var(--chart-expense)`

Eliminate: `text-destructive`, `text-primary` for semantic value coloring, hardcoded Tailwind colors (`text-orange-500`), and `hsl()` wrapping of oklch variables.

### Spacing Standard

All widget root containers use `gap-3`. No exceptions.

### Typography Standard

- Hero numbers: `text-2xl font-bold tabular-nums`
- Stat labels: `text-[11px] uppercase tracking-wider text-muted-foreground`
- Stat values: `text-sm font-semibold tabular-nums`
- Notes/footers: `text-xs text-muted-foreground`
- Progress bars: `h-1.5`

## Widgets to Fix

1. **Income vs Expenses** - Chart colors
2. **Cash Flow** - Chart colors
3. **Savings Rate** - Color mixing, gap, label typography
4. **Budget Overview** - Color mixing, gap
5. **FIRE Calculator** - Hardcoded orange, gap, hsl bug, label sizes
6. **Top Merchants** - Hero font weight, amount text color
7. **Current Budget** - Progress bar height
8. **Account Balances** - Gap, missing min-h-0

Widgets that are fine: Net Worth, Spending by Category, Monthly Spending Trend, Recent Transactions.
