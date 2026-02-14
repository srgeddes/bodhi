"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

// Deduplicates in-flight GET requests to the same endpoint.
// Multiple components requesting the same URL simultaneously share one HTTP request.
const inflightRequests = new Map<string, Promise<unknown>>();

function deduplicatedGet<T>(endpoint: string): Promise<T> {
  const existing = inflightRequests.get(endpoint);
  if (existing) return existing as Promise<T>;

  const promise = apiClient.get<T>(endpoint).finally(() => {
    inflightRequests.delete(endpoint);
  });
  inflightRequests.set(endpoint, promise);
  return promise;
}

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  endpoint: string,
  options?: { enabled?: boolean }
): UseFetchResult<T> {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await deduplicatedGet<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
