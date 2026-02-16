"use client";

import { InstitutionLogo } from "@/components/InstitutionLogo";
import { formatCurrency, formatLabel } from "@/utils/format.utils";
import { cn } from "@/lib/utils";
import type { AccountResponseDto } from "@/dtos/account";

const typeLabels: Record<string, string> = {
  depository: "Bank Account",
  credit: "Credit Card",
  investment: "Investment",
  brokerage: "Brokerage",
  loan: "Loan",
};

interface AccountCardProps {
  account: AccountResponseDto;
}

export function AccountCard({ account }: AccountCardProps) {
  const typeLabel = typeLabels[account.type.toLowerCase()] ?? "Account";
  const balance = account.displayBalance ?? account.currentBalance ?? 0;
  const isDebt = account.type.toLowerCase() === "credit" || account.type.toLowerCase() === "loan";

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 transition-all duration-200 hover:border-border hover:shadow-sm">
      {/* Institution logo or type icon fallback */}
      <div className="shrink-0">
        <InstitutionLogo
          institutionName={account.institutionName ?? account.name}
          size={36}
          className="rounded-lg"
        />
      </div>

      {/* Account info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {account.name}
          </span>
          {account.mask && (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground/60">
              ••{account.mask}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground/70">
          {account.subtype ? formatLabel(account.subtype) : typeLabel}
        </span>
      </div>

      {/* Balance */}
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums text-foreground",
            isDebt && balance > 0 && "text-[var(--error-text)]"
          )}
        >
          {isDebt && balance > 0 && "\u2212"}
          {formatCurrency(Math.abs(balance), account.currency)}
        </span>
        {account.type.toLowerCase() === "credit" && account.limitAmount != null && (
          <span className="text-[10px] tabular-nums text-muted-foreground/60">
            of {formatCurrency(account.limitAmount, account.currency)} limit
          </span>
        )}
        {account.type.toLowerCase() === "depository" &&
          account.availableBalance != null &&
          account.availableBalance !== account.currentBalance && (
            <span className="text-[10px] tabular-nums text-muted-foreground/60">
              {formatCurrency(account.availableBalance, account.currency)} available
            </span>
          )}
      </div>
    </div>
  );
}
