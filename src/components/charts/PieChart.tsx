"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { type ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BaseChart } from "./BaseChart";

interface PieChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  config: ChartConfig;
  height?: number;
  isLoading?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

export function PieChartComponent({
  data,
  config,
  height,
  isLoading,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = true,
}: PieChartProps) {
  return (
    <BaseChart config={config} height={height} isLoading={isLoading} isEmpty={data.length === 0}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || `var(--color-${entry.name})`}
              stroke="none"
            />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && (
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        )}
      </RechartsPieChart>
    </BaseChart>
  );
}
