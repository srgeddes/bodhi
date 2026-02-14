import { useDashboardStore } from "@/store/dashboard.store";

describe("Dashboard Store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useDashboardStore.setState(useDashboardStore.getInitialState());
  });

  it("starts with default widgets", () => {
    const state = useDashboardStore.getState();
    expect(state.widgets.length).toBe(3);
    expect(state.widgets[0].type).toBe("net-worth");
    expect(state.widgets[1].type).toBe("current-budget");
    expect(state.widgets[2].type).toBe("recent-transactions");
  });

  it("starts with default layout", () => {
    const state = useDashboardStore.getState();
    expect(state.layout.length).toBe(3);
  });

  it("isEditing defaults to false", () => {
    const state = useDashboardStore.getState();
    expect(state.isEditing).toBe(false);
  });

  describe("addWidget", () => {
    it("adds widget and layout item", () => {
      const before = useDashboardStore.getState().widgets.length;
      useDashboardStore.getState().addWidget("test-widget", "Test Widget");
      const after = useDashboardStore.getState();
      expect(after.widgets.length).toBe(before + 1);
      expect(after.layout.length).toBe(before + 1);
    });

    it("accepts optional settings", () => {
      useDashboardStore.getState().addWidget("ai-generated", "AI Chart", { chartConfig: { type: "pie" } });
      const state = useDashboardStore.getState();
      const added = state.widgets[state.widgets.length - 1];
      expect(added.settings.chartConfig).toEqual({ type: "pie" });
    });
  });

  describe("removeWidget", () => {
    it("removes widget and layout item", () => {
      const state = useDashboardStore.getState();
      const firstWidgetId = state.widgets[0].id;
      const beforeCount = state.widgets.length;

      state.removeWidget(firstWidgetId);

      const after = useDashboardStore.getState();
      expect(after.widgets.length).toBe(beforeCount - 1);
      expect(after.widgets.find((w) => w.id === firstWidgetId)).toBeUndefined();
      expect(after.layout.find((l) => l.i === firstWidgetId)).toBeUndefined();
    });
  });

  describe("updateLayout", () => {
    it("replaces layout", () => {
      const newLayout = [{ i: "test", x: 0, y: 0, w: 4, h: 3 }];
      useDashboardStore.getState().updateLayout(newLayout);
      expect(useDashboardStore.getState().layout).toEqual(newLayout);
    });
  });

  describe("updateWidgetSettings", () => {
    it("merges settings for specific widget", () => {
      const state = useDashboardStore.getState();
      const widgetId = state.widgets[0].id;

      state.updateWidgetSettings(widgetId, { color: "red" });

      const updated = useDashboardStore.getState().widgets.find((w) => w.id === widgetId);
      expect(updated!.settings.color).toBe("red");
    });
  });

  describe("toggleEditing", () => {
    it("flips isEditing", () => {
      expect(useDashboardStore.getState().isEditing).toBe(false);
      useDashboardStore.getState().toggleEditing();
      expect(useDashboardStore.getState().isEditing).toBe(true);
      useDashboardStore.getState().toggleEditing();
      expect(useDashboardStore.getState().isEditing).toBe(false);
    });
  });

  describe("resetLayout", () => {
    it("reverts to defaults", () => {
      // Modify state
      useDashboardStore.getState().addWidget("custom", "Custom");
      useDashboardStore.getState().toggleEditing();

      // Reset
      useDashboardStore.getState().resetLayout();

      const state = useDashboardStore.getState();
      expect(state.isEditing).toBe(false);
      expect(state.widgets.length).toBe(3);
      expect(state.layout.length).toBe(3);
    });
  });
});
