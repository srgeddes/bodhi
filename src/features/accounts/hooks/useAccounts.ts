"use client";

import { useFetch } from "@/hooks/useFetch";
import type { AccountResponseDto } from "@/dtos/account";

interface AccountsResponse {
  data: AccountResponseDto[];
}

export function useAccounts() {
  const { data, isLoading, error, refetch } = useFetch<AccountsResponse>("/api/accounts");

  return {
    accounts: data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
}
