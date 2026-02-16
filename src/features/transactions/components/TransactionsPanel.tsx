"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, ArrowUpRight, ArrowDownRight, ListFilter, X, Receipt } from "lucide-react";
import { format } from "date-fns";
import { classifyTransaction, computeAggregates } from "@/utils/transaction.utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from "./TransactionTable";
import { TransactionDetailModal } from "./TransactionDetailModal";
import {
  TransactionFilterPopover,
  ActiveFilterPills,
  DEFAULT_FILTERS,
  type TransactionFilterState,
} from "./TransactionFilters";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useSubscriptions } from "@/features/transactions/hooks/useSubscriptions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import type { TransactionResponseDto } from "@/dtos/transaction";

const PAGE_SIZE = 50;

type FlowFilter = "all" | "income" | "expenses";

function filtersToQueryString(
  filters: TransactionFilterState,
  search: string,
  page: number,
  subscriptionMerchantNames?: string[]
): string {
  const parts: string[] = [];

  if (filters.dateRange?.from) {
    parts.push(`startDate=${format(filters.dateRange.from, "yyyy-MM-dd")}`);
  }
  if (filters.dateRange?.to) {
    parts.push(`endDate=${format(filters.dateRange.to, "yyyy-MM-dd")}`);
  }
  if (filters.categories.length > 0) {
    parts.push(`categories=${filters.categories.join(",")}`);
  }
  if (filters.accountIds.length > 0) {
    parts.push(`accountIds=${filters.accountIds.join(",")}`);
  }
  if (filters.minAmount) {
    parts.push(`minAmount=${filters.minAmount}`);
  }
  if (filters.maxAmount) {
    parts.push(`maxAmount=${filters.maxAmount}`);
  }
  if (filters.isPending !== undefined) {
    parts.push(`isPending=${filters.isPending}`);
  }
  if (filters.isTransfer !== undefined) {
    parts.push(`isTransfer=${filters.isTransfer}`);
  }
  if (filters.isExcluded !== undefined) {
    parts.push(`isExcluded=${filters.isExcluded}`);
  }
  if (filters.isSubscription === true && subscriptionMerchantNames?.length) {
    parts.push(`merchantNames=${subscriptionMerchantNames.join(",")}`);
  }
  if (search) {
    parts.push(`search=${encodeURIComponent(search)}`);
  }

  parts.push(`limit=${PAGE_SIZE}`);
  parts.push(`offset=${page * PAGE_SIZE}`);

  return parts.join("&");
}

export function TransactionsPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [flowFilter, setFlowFilter] = useState<FlowFilter>("all");
  const [filters, setFilters] = useState<TransactionFilterState>({ ...DEFAULT_FILTERS });
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDto | null>(null);

  const { accounts } = useAccounts();
  const { merchantNames: subscriptionMerchantNames, markNotSubscription } = useSubscriptions();

  const queryString = useMemo(
    () => filtersToQueryString(filters, search, page, subscriptionMerchantNames),
    [filters, search, page, subscriptionMerchantNames]
  );

  const { transactions: rawTransactions, total, hasMore, isLoading } =
    useTransactions(queryString);

  const transactions = useMemo(() => {
    let result = rawTransactions;

    if (filters.isSubscription === false && subscriptionMerchantNames.length > 0) {
      const subSet = new Set(subscriptionMerchantNames);
      result = result.filter((t) => !subSet.has(t.merchantName ?? t.name));
    }

    if (flowFilter === "income") {
      return result.filter((t) => classifyTransaction(t) === "income");
    }
    if (flowFilter === "expenses") {
      return result.filter((t) => classifyTransaction(t) === "expense");
    }
    return result;
  }, [rawTransactions, flowFilter, filters.isSubscription, subscriptionMerchantNames]);

  const clientAggregates = useMemo(() => computeAggregates(transactions), [transactions]);

  const handleFiltersChange = useCallback((next: TransactionFilterState) => {
    setFilters(next);
    setPage(0);
  }, []);

  // Pagination display helpers
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE + transactions.length, total);

  if (isLoading && rawTransactions.length === 0) {
    return (
      <div className="space-y-4 p-1">
        {/* Toolbar skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-9 w-[80px]" />
          </div>
        </div>

        {/* Summary strip skeleton */}
        <Skeleton className="h-5 w-[320px]" />

        {/* Table skeleton */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full border-t border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar: search + flow tabs + filter popover */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={flowFilter}
            onValueChange={(v) => {
              setFlowFilter(v as FlowFilter);
              setPage(0);
            }}
          >
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5 text-xs">
                <ListFilter className="size-3.5" />
                All
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-1.5 text-xs">
                <ArrowUpRight className="size-3.5" />
                Income
              </TabsTrigger>
              <TabsTrigger value="expenses" className="gap-1.5 text-xs">
                <ArrowDownRight className="size-3.5" />
                Expenses
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <TransactionFilterPopover
            filters={filters}
            onChange={handleFiltersChange}
            accounts={accounts}
          />
        </div>
      </div>

      {/* Active filter pills */}
      <ActiveFilterPills
        filters={filters}
        onChange={handleFiltersChange}
        accounts={accounts}
      />

      {/* Content area — scrolls within widget */}
      <div className="min-h-0 flex-1 overflow-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-4">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {flowFilter !== "all"
                ? `No ${flowFilter} transactions found`
                : "No transactions found"}
            </p>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search or clearing filters"
                : flowFilter !== "all"
                  ? "Try switching to \"All\" to see all transactions"
                  : filters.dateRange
                    ? "Try expanding your date range or clearing filters"
                    : "Connect an account to see transactions"}
            </p>
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              onTransactionClick={setSelectedTransaction}
              aggregates={clientAggregates}
            />

            {(page > 0 || hasMore) && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">{rangeStart}</span>
                  {"\u2013"}
                  <span className="font-medium text-foreground">{rangeEnd}</span>
                  {" of "}
                  <span className="font-medium text-foreground">{total}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
        subscriptionMerchantNames={subscriptionMerchantNames}
        onMarkNotSubscription={async (merchantName) => {
          await markNotSubscription(merchantName);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
}
