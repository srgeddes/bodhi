"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BaseChart } from "./BaseChart";

interface LineChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  yKeys: string[];
  config: ChartConfig;
  height?: number;
  isLoading?: boolean;
  showDots?: boolean;
}

export function LineChartComponent({
  data,
  xKey,
  yKeys,
  config,
  height,
  isLoading,
  showDots = true,
}: LineChartProps) {
  return (
    <BaseChart config={config} height={height} isLoading={isLoading} isEmpty={data.length === 0}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
        {yKeys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={showDots ? { r: 3, fill: `var(--color-${key})` } : false}
            activeDot={{ r: 5 }}
          />
        ))}
      </RechartsLineChart>
    </BaseChart>
  );
}
