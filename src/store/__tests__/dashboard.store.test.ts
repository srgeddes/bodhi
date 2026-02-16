import { useDashboardStore } from "@/store/dashboard.store";

describe("Dashboard Store", () => {
  beforeEach(() => {
    useDashboardStore.setState(useDashboardStore.getInitialState());
  });

  it("starts with default widgets", () => {
    const state = useDashboardStore.getState();
    expect(state.widgets.length).toBe(6);
    expect(state.widgets[0].type).toBe("net-worth");
    expect(state.widgets[1].type).toBe("account-balances");
    expect(state.widgets[2].type).toBe("spending-by-category");
  });

  it("starts with default layout", () => {
    const state = useDashboardStore.getState();
    expect(state.layout.length).toBe(6);
  });

  it("isEditing defaults to false", () => {
    const state = useDashboardStore.getState();
    expect(state.isEditing).toBe(false);
  });

  describe("addWidget", () => {
    it("adds widget and layout item", () => {
      const before = useDashboardStore.getState().widgets.length;
      useDashboardStore.getState().addWidget("savings-rate", "Savings Rate");
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
      useDashboardStore.getState().addWidget("fire-calculator", "FIRE Calc");
      useDashboardStore.getState().toggleEditing();

      useDashboardStore.getState().resetLayout();

      const state = useDashboardStore.getState();
      expect(state.isEditing).toBe(false);
      expect(state.widgets.length).toBe(6);
      expect(state.layout.length).toBe(6);
    });
  });
});
