"use client";

import { useMemo } from "react";
import { useIsDemo } from "@/features/demo/DemoProvider";
import { getMockData, type MockDataType } from "@/features/dashboard/mock-data";
import { useFetch } from "@/hooks/useFetch";
import type { AccountResponseDto } from "@/dtos/account";
import type { TransactionResponseDto } from "@/dtos/transaction";
import type { PaginatedResponse } from "@/types/api.types";
import { isExpense, isIncome } from "@/utils/transaction.utils";

interface AccountsApiResponse {
  data: AccountResponseDto[];
}

const MONTH_START = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};

const SIX_MONTHS_AGO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
};

/** Widget types that need account data */
const ACCOUNT_WIDGETS = new Set(["account-balances", "net-worth"]);

/** Widget types that need transaction data */
const TRANSACTION_WIDGETS = new Set([
  "spending-by-category",
  "income-vs-expenses",
]);

export function useWidgetData(type: string) {
  const isDemo = useIsDemo();

  const needsAccounts = !isDemo && ACCOUNT_WIDGETS.has(type);
  const needsTransactions = !isDemo && TRANSACTION_WIDGETS.has(type);

  const {
    data: accountsRaw,
    isLoading: accountsLoading,
    error: accountsError,
  } = useFetch<AccountsApiResponse>("/api/accounts", { enabled: needsAccounts });

  const txnEndpoint = `/api/transactions?limit=200&offset=0&startDate=${type === "income-vs-expenses" ? SIX_MONTHS_AGO() : MONTH_START()}`;

  const {
    data: transactionsRaw,
    isLoading: txnLoading,
    error: txnError,
  } = useFetch<PaginatedResponse<TransactionResponseDto>>(txnEndpoint, {
    enabled: needsTransactions,
  });

  const data = useMemo(() => {
    if (isDemo) {
      return getMockData(type as MockDataType);
    }

    switch (type) {
      case "account-balances": {
        if (!accountsRaw?.data) return null;
        return accountsRaw.data.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          balance: a.displayBalance ?? a.currentBalance ?? 0,
          institution: a.institutionName ?? "Unknown",
          mask: a.mask ?? "",
        }));
      }

      case "net-worth": {
        if (!accountsRaw?.data) return null;
        const accounts = accountsRaw.data;
        const assets = accounts
          .filter((a) => a.type === "DEPOSITORY" || a.type === "INVESTMENT")
          .reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
        const liabilities = accounts
          .filter((a) => a.type === "CREDIT" || a.type === "LOAN")
          .reduce((sum, a) => sum + Math.abs(a.currentBalance ?? 0), 0);
        const netWorth = assets - liabilities;
        const now = new Date();
        const monthLabel = now.toLocaleDateString("en-US", { month: "short" });
        return {
          current: netWorth,
          previous: netWorth, // No historical data for live — shows 0 change
          assets,
          liabilities,
          history: [{ month: monthLabel, value: netWorth, assets, liabilities }],
        };
      }

      case "spending-by-category": {
        if (!transactionsRaw?.data) return null;
        const categoryMap = new Map<string, number>();
        for (const t of transactionsRaw.data) {
          if (isExpense(t.amount)) {
            const cat = t.category ?? "Other";
            categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Math.abs(t.amount));
          }
        }
        const chartColors = [
          "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
          "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)",
        ];
        return Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([name, amount], i) => ({
            name,
            amount: Math.round(amount * 100) / 100,
            color: chartColors[i % chartColors.length],
          }));
      }

      case "income-vs-expenses": {
        if (!transactionsRaw?.data) return null;
        const monthlyMap = new Map<string, { income: number; expenses: number }>();
        for (const t of transactionsRaw.data) {
          const d = new Date(t.date);
          const key = d.toLocaleDateString("en-US", { month: "short" });
          const entry = monthlyMap.get(key) ?? { income: 0, expenses: 0 };
          if (isIncome(t.amount)) {
            entry.income += t.amount;
          } else {
            entry.expenses += Math.abs(t.amount);
          }
          monthlyMap.set(key, entry);
        }
        return Array.from(monthlyMap.entries()).map(([month, vals]) => ({
          month,
          income: Math.round(vals.income * 100) / 100,
          expenses: Math.round(vals.expenses * 100) / 100,
        }));
      }

      default:
        // Widget types not yet wired to real data — fall back to mock
        return getMockData(type as MockDataType);
    }
  }, [type, isDemo, accountsRaw, transactionsRaw]);

  const isLoading = needsAccounts ? accountsLoading : needsTransactions ? txnLoading : false;
  const error = needsAccounts ? accountsError : needsTransactions ? txnError : null;

  return { data, isLoading, error };
}
