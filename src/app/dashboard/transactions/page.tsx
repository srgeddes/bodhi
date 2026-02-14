"use client";

import { PageContainer } from "@/components/layout";
import { TransactionsPanel } from "@/features/transactions/components/TransactionsPanel";

export default function TransactionsPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and categorize your spending activity
        </p>
      </div>
      <TransactionsPanel />
    </PageContainer>
  );
}
