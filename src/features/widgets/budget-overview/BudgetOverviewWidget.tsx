"use client";

import { Badge } from "@/components/ui/badge";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency } from "@/utils/format.utils";

interface BudgetCategory {
  category: string;
  budgeted: number;
  spent: number;
  color: string;
}

export function BudgetOverviewWidget() {
  const { data } = useWidgetData("budget-overview");
  const budgets = (data as BudgetCategory[]) ?? [];

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;
  const isOverallOver = totalSpent > totalBudgeted;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Overall budget summary */}
      <div className="shrink-0 space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Total Budget
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-sm text-muted-foreground">
            / {formatCurrency(totalBudgeted)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(overallPct, 100)}%`,
                backgroundColor: isOverallOver
                  ? "var(--error-text)"
                  : "var(--primary)",
              }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
            {overallPct}%
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex-1 min-h-0 overflow-auto space-y-3">
        {budgets.map((budget) => {
          const pct = budget.budgeted > 0
            ? (budget.spent / budget.budgeted) * 100
            : 0;
          const isOver = budget.spent > budget.budgeted;
          const difference = Math.abs(budget.spent - budget.budgeted);

          return (
            <div key={budget.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: budget.color }}
                  />
                  <span className="text-foreground truncate">
                    {budget.category}
                  </span>
                  {isOver && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Over
                    </Badge>
                  )}
                </div>
                <span
                  className={`text-xs tabular-nums shrink-0 ${
                    isOver
                      ? "text-[var(--error-text)]"
                      : "text-[var(--success-text)]"
                  }`}
                >
                  {isOver
                    ? `${formatCurrency(difference)} over`
                    : `${formatCurrency(difference)} left`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: budget.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
