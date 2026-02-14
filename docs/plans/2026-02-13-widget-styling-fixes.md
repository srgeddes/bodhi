# Widget Styling Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all widget styling inconsistencies - colors, spacing, typography, and bugs - across all 12 dashboard widgets.

**Architecture:** Pure CSS variable additions + targeted edits to 8 widget files. No structural changes, no new components, no logic changes.

**Tech Stack:** CSS custom properties (oklch), Tailwind classes, Recharts chart configs.

---

### Task 1: Add Semantic Chart CSS Variables

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add income/expense chart variables to light theme**

In the `:root` block, after the existing chart palette (after `--chart-7`), add:

```css
/* Semantic chart colors for income/expense visualizations */
--chart-income: oklch(0.55 0.1 145);
--chart-expense: oklch(0.55 0.1 15);
```

**Step 2: Add income/expense chart variables to dark theme**

In the `.dark` block, after the dark chart palette (after `--chart-7`), add:

```css
--chart-income: oklch(0.65 0.12 145);
--chart-expense: oklch(0.65 0.1 15);
```

**Step 3: Add theme inline mappings**

In the `@theme inline` block, after `--color-chart-7`, add:

```css
--color-chart-income: var(--chart-income);
--color-chart-expense: var(--chart-expense);
```

**Step 4: Verify**

Run: `yarn build` or check that the dev server has no CSS errors.

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add semantic chart-income and chart-expense CSS variables"
```

---

### Task 2: Fix Income vs Expenses Widget

**Files:**
- Modify: `src/features/widgets/income-vs-expenses/IncomeVsExpensesWidget.tsx`

**Step 1: Update chartConfig colors**

Change lines 21-30 from:
```typescript
const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
```

To:
```typescript
const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-income)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-expense)",
  },
} satisfies ChartConfig;
```

**Step 2: Commit**

```bash
git add src/features/widgets/income-vs-expenses/IncomeVsExpensesWidget.tsx
git commit -m "fix: use semantic income/expense colors instead of orange clay"
```

---

### Task 3: Fix Cash Flow Widget

**Files:**
- Modify: `src/features/widgets/cash-flow/CashFlowWidget.tsx`

**Step 1: Update chartConfig colors**

Change lines 21-30 from:
```typescript
const chartConfig = {
  inflow: {
    label: "Inflow",
    color: "var(--chart-1)",
  },
  negativeOutflow: {
    label: "Outflow",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
```

To:
```typescript
const chartConfig = {
  inflow: {
    label: "Inflow",
    color: "var(--chart-income)",
  },
  negativeOutflow: {
    label: "Outflow",
    color: "var(--chart-expense)",
  },
} satisfies ChartConfig;
```

**Step 2: Commit**

```bash
git add src/features/widgets/cash-flow/CashFlowWidget.tsx
git commit -m "fix: use semantic inflow/outflow chart colors"
```

---

### Task 4: Fix Savings Rate Widget

**Files:**
- Modify: `src/features/widgets/savings-rate/SavingsRateWidget.tsx`

**Step 1: Fix getGaugeColor function**

Change:
```typescript
function getGaugeColor(rate: number): string {
  if (rate >= 0.2) return "var(--primary)";
  if (rate >= 0.1) return "var(--chart-4)";
  return "var(--destructive)";
}
```

To:
```typescript
function getGaugeColor(rate: number): string {
  if (rate >= 0.2) return "var(--success-text)";
  if (rate >= 0.1) return "var(--warning-text)";
  return "var(--error-text)";
}
```

**Step 2: Fix root container gap**

Change:
```tsx
<div className="h-full flex flex-col items-center justify-center gap-4">
```

To:
```tsx
<div className="h-full flex flex-col items-center justify-center gap-3">
```

**Step 3: Fix negative trend color mixing**

Change:
```tsx
            className={`flex items-center gap-0.5 text-xs ${
              improved
                ? "text-[var(--success-text)]"
                : "text-destructive"
            }`}
```

To:
```tsx
            className={`flex items-center gap-0.5 text-xs ${
              improved
                ? "text-[var(--success-text)]"
                : "text-[var(--error-text)]"
            }`}
```

**Step 4: Fix bottom stats label styling**

Change all three bottom stat labels from `text-xs text-muted-foreground` to `text-[11px] uppercase tracking-wider text-muted-foreground`:

```tsx
<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Income</p>
```
```tsx
<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Expenses</p>
```
```tsx
<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Saved</p>
```

**Step 5: Fix "Saved" value color**

Change:
```tsx
<p className="font-medium tabular-nums text-primary">
```

To:
```tsx
<p className="font-medium tabular-nums text-[var(--success-text)]">
```

**Step 6: Commit**

```bash
git add src/features/widgets/savings-rate/SavingsRateWidget.tsx
git commit -m "fix: standardize savings rate colors, spacing, and typography"
```

---

### Task 5: Fix Budget Overview Widget

**Files:**
- Modify: `src/features/widgets/budget-overview/BudgetOverviewWidget.tsx`

**Step 1: Fix root container gap**

Change:
```tsx
<div className="h-full flex flex-col gap-4">
```

To:
```tsx
<div className="h-full flex flex-col gap-3">
```

**Step 2: Fix color mixing - use error-text instead of destructive**

Change line 83-86:
```tsx
                  className={`text-xs tabular-nums shrink-0 ${
                    isOver
                      ? "text-destructive"
                      : "text-[var(--success-text)]"
                  }`}
```

To:
```tsx
                  className={`text-xs tabular-nums shrink-0 ${
                    isOver
                      ? "text-[var(--error-text)]"
                      : "text-[var(--success-text)]"
                  }`}
```

**Step 3: Fix overall progress bar color**

Change:
```tsx
                backgroundColor: isOverallOver
                  ? "var(--destructive)"
                  : "var(--primary)",
```

To:
```tsx
                backgroundColor: isOverallOver
                  ? "var(--error-text)"
                  : "var(--primary)",
```

**Step 4: Commit**

```bash
git add src/features/widgets/budget-overview/BudgetOverviewWidget.tsx
git commit -m "fix: standardize budget overview colors and spacing"
```

---

### Task 6: Fix FIRE Calculator Widget

**Files:**
- Modify: `src/features/widgets/fire-calculator/FIRECalculatorWidget.tsx`

**Step 1: Fix root container gap**

Change:
```tsx
<div className="h-full flex flex-col gap-2.5">
```

To:
```tsx
<div className="h-full flex flex-col gap-3">
```

**Step 2: Fix hardcoded orange icon**

Change:
```tsx
<Flame className="h-3.5 w-3.5 text-orange-500" />
```

To:
```tsx
<Flame className="h-3.5 w-3.5 text-[var(--warning-text)]" />
```

**Step 3: Fix hsl bug on ReferenceLine**

Change:
```tsx
stroke="hsl(var(--muted-foreground))"
```

To:
```tsx
stroke="var(--muted-foreground)"
```

**Step 4: Standardize label sizes to text-[11px]**

In the FIRE Projection label, change:
```tsx
<span className="text-[11px] uppercase tracking-wider text-muted-foreground">
```
(This one is already correct - leave it.)

In the stats grid labels (lines 189, 195), change `text-[10px]` to `text-[11px]`:
```tsx
<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Saving</p>
```
```tsx
<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Net Worth</p>
```

In the progress labels (line 204), change:
```tsx
<div className="flex justify-between text-[10px] text-muted-foreground">
```
To:
```tsx
<div className="flex justify-between text-[11px] text-muted-foreground">
```

In the milestone labels (line 264), change:
```tsx
<p className="text-[10px] uppercase tracking-wider text-muted-foreground">In {m.label}</p>
```
To:
```tsx
<p className="text-[11px] uppercase tracking-wider text-muted-foreground">In {m.label}</p>
```

**Step 5: Commit**

```bash
git add src/features/widgets/fire-calculator/FIRECalculatorWidget.tsx
git commit -m "fix: standardize FIRE calculator colors, spacing, and typography"
```

---

### Task 7: Fix Top Merchants Widget

**Files:**
- Modify: `src/features/widgets/top-merchants/TopMerchantsWidget.tsx`

**Step 1: Fix hero font weight**

Change:
```tsx
<p className="text-2xl font-semibold tabular-nums tracking-tight">
```

To:
```tsx
<p className="text-2xl font-bold tabular-nums tracking-tight">
```

**Step 2: Fix merchant amount text color**

Change:
```tsx
<span className="tabular-nums text-muted-foreground whitespace-nowrap">
```

To:
```tsx
<span className="tabular-nums text-foreground whitespace-nowrap">
```

**Step 3: Commit**

```bash
git add src/features/widgets/top-merchants/TopMerchantsWidget.tsx
git commit -m "fix: standardize top merchants font weight and amount colors"
```

---

### Task 8: Fix Current Budget Widget

**Files:**
- Modify: `src/features/widgets/current-budget/CurrentBudgetWidget.tsx`

**Step 1: Fix progress bar height**

Change:
```tsx
<Progress
  value={Math.min(percentUsed, 100)}
  className="h-3"
  indicatorClassName={progressColor}
/>
```

To:
```tsx
<Progress
  value={Math.min(percentUsed, 100)}
  className="h-1.5"
  indicatorClassName={progressColor}
/>
```

**Step 2: Fix progress color to use semantic vars**

Change:
```tsx
const progressColor =
    percentUsed > 100 ? "bg-destructive" : percentUsed > 75 ? "bg-[var(--warning-text)]" : "";
```

To:
```tsx
const progressColor =
    percentUsed > 100 ? "bg-[var(--error-text)]" : percentUsed > 75 ? "bg-[var(--warning-text)]" : "";
```

**Step 3: Commit**

```bash
git add src/features/widgets/current-budget/CurrentBudgetWidget.tsx
git commit -m "fix: standardize current budget progress bar height and colors"
```

---

### Task 9: Fix Account Balances Widget

**Files:**
- Modify: `src/features/widgets/account-balances/AccountBalancesWidget.tsx`

**Step 1: Fix root container gap and add min-h-0**

Change:
```tsx
<div className="flex h-full flex-col gap-4 overflow-auto">
```

To:
```tsx
<div className="flex h-full flex-col gap-3 overflow-auto">
```

**Step 2: Commit**

```bash
git add src/features/widgets/account-balances/AccountBalancesWidget.tsx
git commit -m "fix: standardize account balances spacing"
```

---

### Task 10: Visual Verification

**Step 1: Run dev server**

Run: `yarn dev`

**Step 2: Check the demo page**

Open `http://localhost:3000/demo` and visually verify:
- Income vs Expenses: bars should be green/rose (not orange)
- Cash Flow: same
- All widgets should have consistent gap-3 spacing
- No hardcoded orange anywhere
- Progress bars all same height
- All labels use consistent 11px uppercase tracking

**Step 3: Check dark mode**

Toggle dark mode and verify chart colors still look correct.

**Step 4: Final commit if any adjustments needed**
