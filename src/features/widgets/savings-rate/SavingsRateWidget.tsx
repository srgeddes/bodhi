"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency, formatPercent } from "@/utils/format.utils";

interface SavingsData {
  income: number;
  expenses: number;
  saved: number;
  rate: number;
  previousRate: number;
}

const ARC_RADIUS = 65;
const ARC_LENGTH = Math.PI * ARC_RADIUS;

function getGaugeColor(rate: number): string {
  if (rate >= 0.2) return "var(--success-text)";
  if (rate >= 0.1) return "var(--warning-text)";
  return "var(--error-text)";
}

export function SavingsRateWidget() {
  const { data } = useWidgetData("savings-rate");
  const savings = data as SavingsData | null;

  const rate = Math.min(savings?.rate ?? 0, 1);
  const previousRate = savings?.previousRate ?? 0;
  const rateDelta = rate - previousRate;
  const improved = rateDelta >= 0;
  const gaugeColor = getGaugeColor(rate);
  const dashOffset = ARC_LENGTH * (1 - rate);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="relative flex-1 min-h-0 flex items-center">
        <svg viewBox="0 0 160 100" className="w-full max-w-[200px]">
          {/* Background arc */}
          <path
            d="M 10 85 A 65 65 0 0 1 150 85"
            fill="none"
            strokeWidth="8"
            stroke="currentColor"
            className="text-secondary"
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <path
            d="M 10 85 A 65 65 0 0 1 150 85"
            fill="none"
            strokeWidth="8"
            stroke={gaugeColor}
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Savings Rate
          </span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatPercent(rate)}
          </span>
          <span
            className={`flex items-center gap-0.5 text-xs ${
              improved
                ? "text-[var(--success-text)]"
                : "text-[var(--error-text)]"
            }`}
          >
            {improved ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {improved ? "+" : ""}
            {formatPercent(Math.abs(rateDelta))} from last month
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-2 text-center text-sm shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Income</p>
          <p className="font-medium tabular-nums text-[var(--success-text)]">
            {formatCurrency(savings?.income ?? 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Expenses</p>
          <p className="font-medium tabular-nums text-[var(--error-text)]">
            {formatCurrency(savings?.expenses ?? 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Saved</p>
          <p className="font-medium tabular-nums text-[var(--success-text)]">
            {formatCurrency(savings?.saved ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
