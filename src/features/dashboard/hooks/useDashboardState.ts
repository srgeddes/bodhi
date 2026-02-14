"use client";

import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useDashboardStore } from "@/store/dashboard.store";

export type DashboardState = "no-accounts" | "no-widgets" | "has-widgets";

export function useDashboardState() {
  const { accounts, isLoading } = useAccounts();
  const widgets = useDashboardStore((s) => s.widgets);

  let state: DashboardState = "has-widgets";
  if (accounts.length === 0) {
    state = "no-accounts";
  } else if (widgets.length === 0) {
    state = "no-widgets";
  }

  return { state, isLoading };
}
