"use client";

import { useEffect, useRef } from "react";
import { useDashboardStore } from "@/store/dashboard.store";

export function useDashboardSync() {
  const loadFromServer = useDashboardStore((s) => s.loadFromServer);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadFromServer();
  }, [loadFromServer]);
}
