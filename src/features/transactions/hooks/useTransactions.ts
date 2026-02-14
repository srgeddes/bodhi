"use client";

import { useFetch } from "@/hooks/useFetch";
import type { TransactionResponseDto } from "@/dtos/transaction";
import type { PaginatedResponse } from "@/types/api.types";

interface TransactionAggregates {
  totalIncome: number;
  totalExpenses: number;
}

export function useTransactions(queryString: string = "") {
  const endpoint = `/api/transactions${queryString ? `?${queryString}` : ""}`;
  const { data, isLoading, error, refetch } =
    useFetch<PaginatedResponse<TransactionResponseDto>>(endpoint);

  const aggregates: TransactionAggregates = {
    totalIncome: data?.aggregates?.totalIncome ?? 0,
    totalExpenses: data?.aggregates?.totalExpenses ?? 0,
  };

  return {
    transactions: data?.data ?? [],
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    aggregates,
    isLoading,
    error,
    refetch,
  };
}
