import { z } from "zod";

export const LayoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
});

export const WidgetConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  settings: z.record(z.string(), z.unknown()),
});

export const SaveDashboardLayoutSchema = z.object({
  layout: z.array(LayoutItemSchema),
  widgets: z.array(WidgetConfigSchema),
});

export type SaveDashboardLayoutDto = z.infer<typeof SaveDashboardLayoutSchema>;
