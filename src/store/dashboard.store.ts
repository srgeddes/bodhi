"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api-client";

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  settings: Record<string, unknown>;
}

interface DashboardState {
  layout: LayoutItem[];
  widgets: WidgetConfig[];
  isEditing: boolean;
  addWidget: (type: string, title: string, settings?: Record<string, unknown>) => void;
  removeWidget: (id: string) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  updateWidgetSettings: (id: string, settings: Record<string, unknown>) => void;
  toggleEditing: () => void;
  resetLayout: () => void;
  loadFromServer: () => Promise<void>;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "w1", type: "net-worth", title: "Net Worth", settings: {} },
  { id: "w2", type: "account-balances", title: "Account Balances", settings: {} },
  { id: "w3", type: "spending-by-category", title: "Spending by Category", settings: {} },
  { id: "w4", type: "income-vs-expenses", title: "Income vs Expenses", settings: {} },
  { id: "w5", type: "cash-flow", title: "Cash Flow", settings: {} },
  { id: "w6", type: "recent-transactions", title: "Transactions", settings: {} },
];

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "w1", x: 0, y: 0, w: 8, h: 5, minW: 4, minH: 3 },
  { i: "w2", x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
  { i: "w3", x: 0, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w4", x: 4, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w5", x: 8, y: 5, w: 4, h: 5, minW: 4, minH: 4 },
  { i: "w6", x: 0, y: 10, w: 12, h: 8, minW: 8, minH: 6 },
];

function getMaxWidgetId(widgets: WidgetConfig[]): number {
  let max = 0;
  for (const w of widgets) {
    const num = parseInt(w.id.replace("w", ""), 10);
    if (!isNaN(num) && num > max) max = num;
  }
  return max;
}

let widgetCounter = getMaxWidgetId(DEFAULT_WIDGETS);

// Debounced sync to server
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function syncToServer(layout: LayoutItem[], widgets: WidgetConfig[]) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    apiClient.put("/api/dashboard/layout", { layout, widgets }).catch(() => {
      // Fire-and-forget — silently fail
    });
  }, 2000);
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      layout: DEFAULT_LAYOUT,
      widgets: DEFAULT_WIDGETS,
      isEditing: false,

      addWidget: (type, title, settings) => {
        const id = `w${++widgetCounter}`;
        set((state) => {
          const newWidgets = [...state.widgets, { id, type, title, settings: settings ?? {} }];
          const newLayout = [...state.layout, { i: id, x: 0, y: Infinity, w: 6, h: 4, minW: 3, minH: 3 }];
          syncToServer(newLayout, newWidgets);
          return { widgets: newWidgets, layout: newLayout };
        });
      },

      removeWidget: (id) =>
        set((state) => {
          const newWidgets = state.widgets.filter((w) => w.id !== id);
          const newLayout = state.layout.filter((l) => l.i !== id);
          syncToServer(newLayout, newWidgets);
          return { widgets: newWidgets, layout: newLayout };
        }),

      updateLayout: (layout) => {
        set({ layout });
        const { widgets } = get();
        syncToServer(layout, widgets);
      },

      updateWidgetSettings: (id, settings) =>
        set((state) => {
          const newWidgets = state.widgets.map((w) =>
            w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w
          );
          syncToServer(state.layout, newWidgets);
          return { widgets: newWidgets };
        }),

      toggleEditing: () => set((state) => ({ isEditing: !state.isEditing })),

      resetLayout: () => {
        set({ layout: DEFAULT_LAYOUT, widgets: DEFAULT_WIDGETS, isEditing: false });
        syncToServer(DEFAULT_LAYOUT, DEFAULT_WIDGETS);
      },

      loadFromServer: async () => {
        try {
          const data = await apiClient.get<{ layout: LayoutItem[]; widgets: WidgetConfig[] }>(
            "/api/dashboard/layout"
          );
          if (data.layout && data.widgets) {
            widgetCounter = Math.max(widgetCounter, getMaxWidgetId(data.widgets));
            set({ layout: data.layout, widgets: data.widgets });
          }
        } catch {
          // Use local state if server fetch fails
        }
      },
    }),
    {
      name: "bodhi-dashboard",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as DashboardState;
        if (version < 2) {
          return { ...state, widgets: DEFAULT_WIDGETS, layout: DEFAULT_LAYOUT };
        }
        return state;
      },
      partialize: (state) => ({
        layout: state.layout,
        widgets: state.widgets,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.widgets) {
          widgetCounter = Math.max(widgetCounter, getMaxWidgetId(state.widgets));
        }
      },
    }
  )
);
