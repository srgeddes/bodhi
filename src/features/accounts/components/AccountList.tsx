"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { getInstitutionLogoUrl } from "@/utils/institution-logo.utils";
import { formatCurrency, formatLabel } from "@/utils/format.utils";
import { cn } from "@/lib/utils";
import type { AccountResponseDto } from "@/dtos/account";

interface InstitutionGroup {
  name: string;
  accounts: AccountResponseDto[];
  total: number;
}

function groupByInstitution(accounts: AccountResponseDto[]): InstitutionGroup[] {
  const map = new Map<string, AccountResponseDto[]>();
  for (const account of accounts) {
    const key = account.institutionName ?? "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(account);
  }

  return Array.from(map.entries())
    .map(([name, accts]) => ({
      name,
      accounts: accts,
      total: accts.reduce((sum, a) => {
        const bal = a.displayBalance ?? a.currentBalance ?? 0;
        const type = a.type.toLowerCase();
        return sum + (type === "credit" || type === "loan" ? -Math.abs(bal) : bal);
      }, 0),
    }))
    .sort((a, b) => b.total - a.total);
}

function InstitutionLogo({ name, size = 36 }: { name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getInstitutionLogoUrl(name, size * 2);

  if (!logoUrl || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-muted"
        style={{ width: size, height: size }}
      >
        <Building2 style={{ width: size * 0.5, height: size * 0.5 }} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className="shrink-0 rounded-full object-contain"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}

function AccountRow({ account }: { account: AccountResponseDto }) {
  const balance = account.displayBalance ?? account.currentBalance ?? 0;
  const isDebt = account.type.toLowerCase() === "credit" || account.type.toLowerCase() === "loan";
  const subtypeLabel = account.subtype ? formatLabel(account.subtype) : null;

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate text-sm font-medium text-foreground">
          {account.name}
        </span>
        {account.mask && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground/50">
            ••{account.mask}
          </span>
        )}
        {subtypeLabel && (
          <span className="hidden shrink-0 text-xs text-muted-foreground/50 sm:inline">
            {subtypeLabel}
          </span>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end">
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
          <span className="text-[10px] tabular-nums text-muted-foreground/50">
            of {formatCurrency(account.limitAmount, account.currency)} limit
          </span>
        )}
        {account.type.toLowerCase() === "depository" &&
          account.availableBalance != null &&
          account.availableBalance !== account.currentBalance && (
            <span className="text-[10px] tabular-nums text-muted-foreground/50">
              {formatCurrency(account.availableBalance, account.currency)} avail.
            </span>
          )}
      </div>
    </div>
  );
}

interface AccountListProps {
  accounts: AccountResponseDto[];
}

export function AccountList({ accounts }: AccountListProps) {
  const groups = groupByInstitution(accounts);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.name} className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {/* Institution header row */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <InstitutionLogo name={group.name} size={28} />
              <span className="text-sm font-medium text-foreground">{group.name}</span>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                group.total < 0 ? "text-[var(--error-text)]" : "text-foreground/70"
              )}
            >
              {group.total < 0 && "\u2212"}
              {formatCurrency(Math.abs(group.total))}
            </span>
          </div>

          {/* Account rows */}
          <div className="divide-y divide-border/30">
            {group.accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
