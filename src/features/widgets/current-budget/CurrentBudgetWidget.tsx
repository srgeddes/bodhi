"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/utils/format.utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { BudgetResponseDto } from "@/dtos/budget";

export function CurrentBudgetWidget() {
  const { data, isLoading, refetch } = useFetch<BudgetResponseDto>("/api/budget");
  const [budgetInput, setBudgetInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSetBudget = async () => {
    const value = parseFloat(budgetInput);
    if (isNaN(value) || value <= 0) return;
    setSaving(true);
    try {
      await apiClient.patch("/api/budget", { monthlyBudget: value });
      setBudgetInput("");
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !data) {
    return <div className="animate-pulse space-y-3"><div className="h-8 bg-muted rounded w-1/2" /><div className="h-3 bg-muted rounded w-full" /></div>;
  }

  // No budget set state
  if (data.monthlyBudget == null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <p className="text-sm text-muted-foreground">Set a monthly spending budget to track your progress.</p>
        <div className="flex gap-2 w-full max-w-xs">
          <Input
            type="number"
            placeholder="e.g. 3000"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetBudget()}
          />
          <Button size="sm" onClick={handleSetBudget} disabled={saving}>
            Set
          </Button>
        </div>
      </div>
    );
  }

  const { monthlyBudget, spent, remaining, percentUsed, daysRemaining } = data;
  const progressColor =
    percentUsed > 100 ? "bg-[var(--error-text)]" : percentUsed > 75 ? "bg-[var(--warning-text)]" : "";
  const dailyBudget = daysRemaining > 0 ? remaining / daysRemaining : 0;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {formatCurrency(spent)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatCurrency(monthlyBudget!)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget`}
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-2">
              <p className="text-xs font-medium">Monthly Budget</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={String(monthlyBudget)}
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetBudget()}
                  className="h-8"
                />
                <Button size="sm" className="h-8" onClick={handleSetBudget} disabled={saving}>
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <Progress
          value={Math.min(percentUsed, 100)}
          className="h-1.5"
          indicatorClassName={progressColor}
        />
        <p className="text-xs text-muted-foreground text-right">
          {percentUsed.toFixed(1)}% used
        </p>
      </div>

      <div className="mt-auto pt-2 border-t border-border/50">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{daysRemaining} days left this month</span>
          {dailyBudget > 0 && <span>{formatCurrency(dailyBudget)}/day</span>}
        </div>
      </div>
    </div>
  );
}
