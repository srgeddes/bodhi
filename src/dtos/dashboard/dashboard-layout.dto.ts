import { z } from "zod";

export const LayoutItemSchema = z.object({
  i: z.string().max(50),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(1000),
  w: z.number().min(1).max(24),
  h: z.number().min(1).max(100),
  minW: z.number().min(1).max(24).optional(),
  minH: z.number().min(1).max(100).optional(),
});

export const WIDGET_TYPES = [
  "account-balances",
  "net-worth",
  "spending-by-category",
  "income-vs-expenses",
  "recent-transactions",
  "cash-flow",
  "monthly-spending-trend",
  "top-merchants",
  "budget-overview",
  "savings-rate",
  "current-budget",
  "fire-calculator",
  "ai-generated",
] as const;

export const WidgetConfigSchema = z.object({
  id: z.string().max(50),
  type: z.enum(WIDGET_TYPES),
  title: z.string().max(200),
  settings: z.record(z.string(), z.unknown()).refine(
    (obj) => JSON.stringify(obj).length <= 10_000,
    { message: "Widget settings exceed maximum size" }
  ),
});

export const SaveDashboardLayoutSchema = z.object({
  layout: z.array(LayoutItemSchema).max(50).refine(
    (items) => new Set(items.map((i) => i.i)).size === items.length,
    { message: "Duplicate layout item IDs" }
  ),
  widgets: z.array(WidgetConfigSchema).max(50).refine(
    (items) => new Set(items.map((w) => w.id)).size === items.length,
    { message: "Duplicate widget IDs" }
  ),
});

export type SaveDashboardLayoutDto = z.infer<typeof SaveDashboardLayoutSchema>;
