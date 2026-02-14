import { useFiltersStore } from "@/store/filters.store";

describe("Filters Store", () => {
  beforeEach(() => {
    useFiltersStore.getState().resetFilters();
  });

  it("has initial date range (first of current month to now)", () => {
    const state = useFiltersStore.getState();
    const now = new Date();
    expect(state.dateRange.start).toBeInstanceOf(Date);
    expect(state.dateRange.end).toBeInstanceOf(Date);
    expect(state.dateRange.start.getDate()).toBe(1);
    expect(state.dateRange.start.getMonth()).toBe(now.getMonth());
    expect(state.dateRange.start.getFullYear()).toBe(now.getFullYear());
    expect(state.dateRange.start < state.dateRange.end).toBe(true);
  });

  it("has empty selectedAccountIds initially", () => {
    const state = useFiltersStore.getState();
    expect(state.selectedAccountIds).toEqual([]);
  });

  describe("setDateRange", () => {
    it("updates start and end", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-06-30");
      useFiltersStore.getState().setDateRange(start, end);
      const state = useFiltersStore.getState();
      expect(state.dateRange.start).toEqual(start);
      expect(state.dateRange.end).toEqual(end);
    });
  });

  describe("setSelectedAccountIds", () => {
    it("updates selected account ids", () => {
      useFiltersStore.getState().setSelectedAccountIds(["acc-1", "acc-2"]);
      expect(useFiltersStore.getState().selectedAccountIds).toEqual(["acc-1", "acc-2"]);
    });
  });

  describe("resetFilters", () => {
    it("reverts to defaults", () => {
      // Modify
      useFiltersStore.getState().setSelectedAccountIds(["acc-1"]);
      useFiltersStore.getState().setDateRange(new Date("2020-01-01"), new Date("2020-12-31"));

      // Reset
      useFiltersStore.getState().resetFilters();

      const state = useFiltersStore.getState();
      expect(state.selectedAccountIds).toEqual([]);
      // Date range should be recent (within last minute)
      const now = new Date();
      expect(state.dateRange.end.getTime()).toBeGreaterThan(now.getTime() - 60000);
    });
  });
});
