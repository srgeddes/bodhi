"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency, formatCompactNumber } from "@/utils/format.utils";

interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
}

const chartConfig = {
  inflow: {
    label: "Inflow",
    color: "var(--chart-income)",
  },
  negativeOutflow: {
    label: "Outflow",
    color: "var(--chart-expense)",
  },
} satisfies ChartConfig;

export function CashFlowWidget() {
  const { data } = useWidgetData("cash-flow");
  const points = (data as CashFlowPoint[]) ?? [];

  const totalInflow = points.reduce((sum, p) => sum + p.inflow, 0);
  const totalOutflow = points.reduce((sum, p) => sum + p.outflow, 0);
  const net = totalInflow - totalOutflow;
  const avgDailySpend = points.length > 0 ? totalOutflow / points.length : 0;

  const chartData = points.map((p) => ({
    date: p.date,
    inflow: p.inflow,
    negativeOutflow: -p.outflow,
  }));

  const netColorClass = net >= 0
    ? "text-[var(--success-text)]"
    : "text-[var(--error-text)]";

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Inflow</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--success-text)]">
            {formatCurrency(totalInflow)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Outflow</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--error-text)]">
            {formatCurrency(totalOutflow)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Net</p>
          <p className={`text-sm font-semibold tabular-nums ${netColorClass}`}>
            {net >= 0 ? "+" : ""}{formatCurrency(net)}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground shrink-0">Last 30 days</p>

      <div className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full [aspect-ratio:unset]">
          <RechartsBarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} stackOffset="sign">
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={50}
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => formatCompactNumber(Math.abs(v))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label = name === "negativeOutflow" ? "Outflow" : "Inflow";
                    return `${label}: ${formatCurrency(Math.abs(value as number))}`;
                  }}
                />
              }
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
            <Bar
              dataKey="inflow"
              fill="var(--color-inflow)"
              radius={[2, 2, 0, 0]}
              stackId="stack"
            />
            <Bar
              dataKey="negativeOutflow"
              fill="var(--color-negativeOutflow)"
              radius={[0, 0, 2, 2]}
              stackId="stack"
            />
          </RechartsBarChart>
        </ChartContainer>
      </div>

      <p className="text-xs text-muted-foreground shrink-0">
        Avg. daily spend: {formatCurrency(avgDailySpend)}
      </p>
    </div>
  );
}
