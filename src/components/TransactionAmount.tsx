"use client";

import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/utils/format.utils";
import { isIncome, displayAmount, amountSign } from "@/utils/transaction.utils";
import { cn } from "@/lib/utils";

interface TransactionAmountProps {
  amount: number;
  isTransfer?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * Consistent transaction amount display used across the entire app.
 *
 * Convention: negative = expense, positive = income.
 * Colors: green for income, foreground for expense, muted for transfer.
 * Icons: ↗ income, ↘ expense, ↔ transfer (optional via showIcon).
 */
export function TransactionAmount({
  amount,
  isTransfer = false,
  showIcon = false,
  className,
}: TransactionAmountProps) {
  const income = isIncome(amount);

  const colorClass = isTransfer
    ? "text-muted-foreground"
    : income
      ? "text-[var(--success-text)]"
      : "text-[var(--error-text)]";

  return (
    <span className={cn("inline-flex items-center gap-1.5 tabular-nums font-semibold text-sm", colorClass, className)}>
      {showIcon && (
        isTransfer ? (
          <ArrowLeftRight className="size-3.5 opacity-50" />
        ) : income ? (
          <ArrowUpRight className="size-3.5" />
        ) : (
          <ArrowDownRight className="size-3.5 opacity-60" />
        )
      )}
      {amountSign(amount)}{formatCurrency(displayAmount(amount))}
    </span>
  );
}
