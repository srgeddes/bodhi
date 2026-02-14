"use client";

import { create } from "zustand";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  settings: Record<string, unknown>;
}

interface DemoDashboardState {
  layout: LayoutItem[];
  widgets: WidgetConfig[];
  isEditing: boolean;
}

const DEMO_WIDGETS: WidgetConfig[] = [
  { id: "w1", type: "net-worth", title: "Net Worth", settings: {} },
  { id: "w2", type: "fire-calculator", title: "FIRE Calculator", settings: { age: 28, annualExpenses: 48000, annualReturn: 7 } },
  { id: "w3", type: "spending-by-category", title: "Spending by Category", settings: {} },
  { id: "w4", type: "income-vs-expenses", title: "Income vs Expenses", settings: {} },
  { id: "w5", type: "cash-flow", title: "Cash Flow", settings: {} },
  { id: "w6", type: "account-balances", title: "Account Balances", settings: {} },
  { id: "w7", type: "top-merchants", title: "Top Merchants", settings: {} },
  { id: "w8", type: "savings-rate", title: "Savings Rate", settings: {} },
  { id: "w9", type: "budget-overview", title: "Budget Overview", settings: {} },
  { id: "w10", type: "monthly-spending-trend", title: "Monthly Spending Trend", settings: {} },
  { id: "w11", type: "recent-transactions", title: "Transactions", settings: {} },
];

const DEMO_LAYOUT: LayoutItem[] = [
  { i: "w1", x: 0, y: 0, w: 8, h: 5, minW: 4, minH: 3 },
  { i: "w2", x: 8, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w3", x: 0, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w4", x: 4, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w5", x: 8, y: 5, w: 4, h: 5, minW: 4, minH: 4 },
  { i: "w6", x: 0, y: 10, w: 4, h: 4, minW: 3, minH: 3 },
  { i: "w7", x: 4, y: 10, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w8", x: 8, y: 10, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "w9", x: 0, y: 15, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "w10", x: 6, y: 15, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "w11", x: 0, y: 20, w: 12, h: 8, minW: 8, minH: 6 },
];

export const useDemoDashboardStore = create<DemoDashboardState>(() => ({
  layout: DEMO_LAYOUT,
  widgets: DEMO_WIDGETS,
  isEditing: false,
}));
