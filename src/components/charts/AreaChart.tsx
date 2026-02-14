"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BaseChart } from "./BaseChart";

interface AreaChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  yKeys: string[];
  config: ChartConfig;
  height?: number;
  isLoading?: boolean;
  showGrid?: boolean;
  gradient?: boolean;
}

export function AreaChartComponent({
  data,
  xKey,
  yKeys,
  config,
  height,
  isLoading,
  showGrid = true,
  gradient = true,
}: AreaChartProps) {
  return (
    <BaseChart config={config} height={height} isLoading={isLoading} isEmpty={data.length === 0}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {gradient && (
          <defs>
            {yKeys.map((key) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
        )}
        {yKeys.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={gradient ? `url(#gradient-${key})` : `var(--color-${key})`}
            fillOpacity={gradient ? 1 : 0.1}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </BaseChart>
  );
}
