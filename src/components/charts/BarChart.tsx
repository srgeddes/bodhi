"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BaseChart } from "./BaseChart";

interface BarChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  yKeys: string[];
  config: ChartConfig;
  height?: number;
  isLoading?: boolean;
  layout?: "vertical" | "horizontal";
  stacked?: boolean;
}

export function BarChartComponent({
  data,
  xKey,
  yKeys,
  config,
  height,
  isLoading,
  layout = "horizontal",
  stacked = false,
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <BaseChart config={config} height={height} isLoading={isLoading} isEmpty={data.length === 0}>
      <RechartsBarChart
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        {isVertical ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey={xKey} tickLine={false} axisLine={false} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={60} />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        {yKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </BaseChart>
  );
}
