"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency, formatCompactNumber } from "@/utils/format.utils";

interface NetWorthData {
  current: number;
  previous: number;
  assets: number;
  liabilities: number;
  history: { month: string; value: number; assets: number; liabilities: number }[];
}

const chartConfig = {
  value: {
    label: "Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function NetWorthWidget() {
  const { data } = useWidgetData("net-worth");
  const nw = data as NetWorthData | null;

  if (!nw) return null;

  const change = nw.current - nw.previous;
  const isPositive = change >= 0;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Hero stat */}
      <div className="shrink-0">
        <div className="flex items-baseline gap-3">
          <span className={`text-2xl font-bold tabular-nums ${nw.current >= 0 ? "text-[var(--success-text)]" : "text-[var(--error-text)]"}`}>
            {formatCurrency(nw.current)}
          </span>
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-[var(--success-text)]" : "text-[var(--error-text)]"}`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : "-"}{formatCurrency(Math.abs(change))}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">vs. last month</p>
      </div>

      {/* Assets / Liabilities row */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Assets</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--success-text)]">
            {formatCurrency(nw.assets)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Liabilities</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--error-text)]">
            {formatCurrency(nw.liabilities)}
          </p>
        </div>
      </div>

      {/* Area chart */}
      <div className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full [aspect-ratio:unset]">
          <RechartsAreaChart data={nw.history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="nw-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill="url(#nw-gradient)"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                if (index === nw.history.length - 1) {
                  return <circle cx={cx} cy={cy} r={4} fill="var(--color-value)" stroke="var(--background)" strokeWidth={2} />;
                }
                return <circle r={0} />;
              }}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
