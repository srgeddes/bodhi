"use client";

import { useMemo } from "react";
import { Building2, CreditCard, TrendingUp, DollarSign, Landmark } from "lucide-react";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { InstitutionLogo } from "@/components/InstitutionLogo";
import { formatCurrency } from "@/utils/format.utils";
import { cn } from "@/lib/utils";

interface MockAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution: string;
  mask: string;
}

interface AccountGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  accounts: MockAccount[];
  subtotal: number;
  kind: "asset" | "debt";
}

const GROUP_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; kind: "asset" | "debt" }
> = {
  DEPOSITORY: {
    label: "Banking",
    icon: <Building2 className="h-3.5 w-3.5" />,
    kind: "asset",
  },
  CREDIT: {
    label: "Credit",
    icon: <CreditCard className="h-3.5 w-3.5" />,
    kind: "debt",
  },
  INVESTMENT: {
    label: "Investment",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    kind: "asset",
  },
  LOAN: {
    label: "Loan",
    icon: <DollarSign className="h-3.5 w-3.5" />,
    kind: "debt",
  },
};

const GROUP_ORDER = ["DEPOSITORY", "CREDIT", "INVESTMENT", "LOAN"];

function buildGroups(accounts: MockAccount[]): AccountGroup[] {
  const grouped = new Map<string, MockAccount[]>();

  for (const account of accounts) {
    const existing = grouped.get(account.type) ?? [];
    existing.push(account);
    grouped.set(account.type, existing);
  }

  return GROUP_ORDER.filter((key) => grouped.has(key)).map((key) => {
    const groupAccounts = grouped.get(key)!;
    const config = GROUP_CONFIG[key] ?? {
      label: key,
      icon: <Landmark className="h-3.5 w-3.5" />,
      kind: "asset" as const,
    };

    return {
      key,
      label: config.label,
      icon: config.icon,
      accounts: groupAccounts,
      subtotal: groupAccounts.reduce((sum, a) => sum + a.balance, 0),
      kind: config.kind,
    };
  });
}

function AccountRow({
  account,
  kind,
}: {
  account: MockAccount;
  kind: "asset" | "debt";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <InstitutionLogo institutionName={account.institution} size={28} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {account.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {account.institution} ••{account.mask}
          </p>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          kind === "debt"
            ? "text-[var(--error-text)]"
            : "text-[var(--success-text)]"
        )}
      >
        {kind === "debt" ? "-" : ""}
        {formatCurrency(Math.abs(account.balance))}
      </span>
    </div>
  );
}

function GroupSection({ group }: { group: AccountGroup }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          {group.icon}
          <span className="text-xs font-medium uppercase tracking-wider">
            {group.label}
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            group.kind === "debt"
              ? "text-[var(--error-text)]"
              : "text-[var(--success-text)]"
          )}
        >
          {group.kind === "debt" ? "-" : ""}
          {formatCurrency(Math.abs(group.subtotal))}
        </span>
      </div>

      <div className="space-y-3">
        {group.accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            kind={group.kind}
          />
        ))}
      </div>
    </div>
  );
}

export function AccountBalancesWidget() {
  const { data } = useWidgetData("account-balances");
  const accounts = (data as MockAccount[]) ?? [];

  const { groups, totalBalance } = useMemo(() => {
    return {
      groups: buildGroups(accounts),
      totalBalance: accounts.reduce((sum, a) => {
        const isDebt = GROUP_CONFIG[a.type]?.kind === "debt";
        return sum + (isDebt ? -Math.abs(a.balance) : a.balance);
      }, 0),
    };
  }, [accounts]);

  if (accounts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No accounts connected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto">
      {/* Hero stat */}
      <div className="shrink-0 space-y-1">
        <span
          className={cn(
            "text-2xl font-bold tabular-nums",
            totalBalance < 0 ? "text-[var(--error-text)]" : "text-foreground"
          )}
        >
          {formatCurrency(totalBalance)}
        </span>
        <p className="text-xs text-muted-foreground">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"}{" "}
          connected
        </p>
      </div>

      {/* Grouped sections */}
      <div className="flex-1 space-y-5">
        {groups.map((group) => (
          <GroupSection key={group.key} group={group} />
        ))}
      </div>
    </div>
  );
}
