"use client";

import { TransactionsPanel } from "@/features/transactions/components/TransactionsPanel";

export function RecentTransactionsWidget() {
  return (
    <div className="h-full overflow-hidden">
      <TransactionsPanel />
    </div>
  );
}
