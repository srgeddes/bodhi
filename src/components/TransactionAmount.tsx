"use client";

import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/utils/format.utils";
import { displayAmount } from "@/utils/transaction.utils";
import type { TransactionFlow } from "@/utils/transaction.utils";
import { cn } from "@/lib/utils";

interface TransactionAmountProps {
  amount: number;
  flow: TransactionFlow;
  showIcon?: boolean;
  className?: string;
}

/**
 * Consistent transaction amount display used across the entire app.
 *
 * Colors: green for income, red for expense, muted for transfer.
 * Icons: ↗ income, ↘ expense, ↔ transfer (optional via showIcon).
 * Sign is derived from flow, not raw amount, so misreported expenses
 * still show "−" even when the underlying amount is positive.
 */
export function TransactionAmount({
  amount,
  flow,
  showIcon = false,
  className,
}: TransactionAmountProps) {
  const colorClass =
    flow === "transfer"
      ? "text-muted-foreground"
      : flow === "income"
        ? "text-[var(--success-text)]"
        : "text-[var(--error-text)]";

  const sign = flow === "income" ? "+" : flow === "expense" ? "\u2212" : "";

  return (
    <span className={cn("inline-flex items-center gap-1.5 tabular-nums font-semibold text-sm", colorClass, className)}>
      {showIcon && (
        flow === "transfer" ? (
          <ArrowLeftRight className="size-3.5 opacity-50" />
        ) : flow === "income" ? (
          <ArrowUpRight className="size-3.5" />
        ) : (
          <ArrowDownRight className="size-3.5 opacity-60" />
        )
      )}
      {sign}{formatCurrency(displayAmount(amount))}
    </span>
  );
}
