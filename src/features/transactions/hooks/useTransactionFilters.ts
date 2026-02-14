"use client";

import { useMemo } from "react";
import { useFiltersStore } from "@/store/filters.store";

export function useTransactionFilters() {
  const { dateRange, selectedAccountIds } = useFiltersStore();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange.start) params.set("startDate", dateRange.start.toISOString());
    if (dateRange.end) params.set("endDate", dateRange.end.toISOString());
    if (selectedAccountIds.length > 0) {
      params.set("accountIds", selectedAccountIds.join(","));
    }
    return params.toString();
  }, [dateRange, selectedAccountIds]);

  return queryString;
}
