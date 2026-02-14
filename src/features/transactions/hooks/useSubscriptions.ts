"use client";

import { useCallback } from "react";
import { useFetch } from "@/hooks/useFetch";
import { apiClient } from "@/lib/api-client";

interface SubscriptionMerchant {
  merchantName: string;
  chargeCount: number;
  averageAmount: number;
  lastChargeDate: string;
}

export function useSubscriptions() {
  const { data, isLoading, error, refetch } =
    useFetch<{ data: SubscriptionMerchant[] }>("/api/transactions/subscriptions");

  const merchants = data?.data ?? [];
  const merchantNames = merchants.map((m) => m.merchantName);

  const markNotSubscription = useCallback(
    async (merchantName: string) => {
      await apiClient.post("/api/transactions/subscriptions", { merchantName });
      refetch();
    },
    [refetch]
  );

  const undoNotSubscription = useCallback(
    async (merchantName: string) => {
      await apiClient.delete(
        `/api/transactions/subscriptions?merchantName=${encodeURIComponent(merchantName)}`
      );
      refetch();
    },
    [refetch]
  );

  return {
    merchants,
    merchantNames,
    isLoading,
    error,
    refetch,
    markNotSubscription,
    undoNotSubscription,
  };
}
