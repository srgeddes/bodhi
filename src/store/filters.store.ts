"use client";

import { create } from "zustand";

interface FiltersState {
  dateRange: { start: Date; end: Date };
  selectedAccountIds: string[];
  setDateRange: (start: Date, end: Date) => void;
  setSelectedAccountIds: (ids: string[]) => void;
  resetFilters: () => void;
}

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start, end };
}

export const useFiltersStore = create<FiltersState>((set) => ({
  dateRange: defaultDateRange(),
  selectedAccountIds: [],
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
  setSelectedAccountIds: (ids) => set({ selectedAccountIds: ids }),
  resetFilters: () =>
    set({ dateRange: defaultDateRange(), selectedAccountIds: [] }),
}));
