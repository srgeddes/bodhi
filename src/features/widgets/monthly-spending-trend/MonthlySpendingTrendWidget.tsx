"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency, formatCompactNumber } from "@/utils/format.utils";

interface MonthlySpend {
  month: string;
  amount: number;
}

const chartConfig = {
  amount: {
    label: "Spending",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MonthlySpendingTrendWidget() {
  const { data } = useWidgetData("monthly-spending-trend");
  const points = (data as MonthlySpend[]) ?? [];

  const currentMonth = points[points.length - 1]?.amount ?? 0;
  const lastMonth = points[points.length - 2]?.amount ?? 0;
  const average =
    points.length > 0
      ? points.reduce((sum, p) => sum + p.amount, 0) / points.length
      : 0;

  const change = currentMonth - lastMonth;
  const isUp = change >= 0;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Hero stat */}
      <div className="shrink-0">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(currentMonth)}
          </span>
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              isUp
                ? "text-[var(--error-text)]"
                : "text-[var(--success-text)]"
            }`}
          >
            {isUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isUp ? "+" : "-"}
            {formatCurrency(Math.abs(change))} vs last month
          </span>
        </div>
      </div>

      {/* Three-column summary stats */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            This Month
          </p>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(currentMonth)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Last Month
          </p>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(lastMonth)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            12-mo Average
          </p>
          <p className="text-sm font-semibold tabular-nums text-muted-foreground">
            {formatCurrency(average)}
          </p>
        </div>
      </div>

      {/* Area chart */}
      <div className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full [aspect-ratio:unset]">
          <RechartsAreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spending-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={50}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => formatCompactNumber(v)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            {average > 0 && (
              <ReferenceLine
                y={average}
                stroke="var(--color-amount)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-amount)"
              fill="url(#spending-gradient)"
              strokeWidth={2}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
