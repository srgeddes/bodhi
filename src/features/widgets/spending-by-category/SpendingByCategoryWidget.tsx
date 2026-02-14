"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
} from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency } from "@/utils/format.utils";

interface CategorySpend {
  name: string;
  amount: number;
  color: string;
}

export function SpendingByCategoryWidget() {
  const { data } = useWidgetData("spending-by-category");
  const categories = (data as CategorySpend[]) ?? [];

  const total = categories.reduce((sum, c) => sum + c.amount, 0);
  const maxAmount = Math.max(...categories.map((c) => c.amount), 1);

  const chartConfig = categories.reduce<ChartConfig>((acc, cat) => {
    acc[cat.name] = { label: cat.name, color: cat.color };
    return acc;
  }, {});

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    fill: cat.color,
  }));

  // Show top 6, group rest as "Other"
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);
  const displayCategories = sortedCategories.length > 6
    ? [
        ...sortedCategories.slice(0, 6),
        {
          name: "Other",
          amount: sortedCategories.slice(6).reduce((s, c) => s + c.amount, 0),
          color: "var(--chart-7)",
        },
      ]
    : sortedCategories;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Total spending */}
      <div className="shrink-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Spending</p>
        <p className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(total)}</p>
      </div>

      {/* Donut chart with center label */}
      <div className="shrink-0 mx-auto" style={{ width: 180, height: 180 }}>
        <ChartContainer config={chartConfig} className="h-full w-full [aspect-ratio:unset]">
          <RechartsPieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} dy="-0.3em" className="fill-foreground text-lg font-bold">
                          {formatCurrency(total)}
                        </tspan>
                        <tspan x={viewBox.cx} dy="1.4em" className="fill-muted-foreground text-[10px]">
                          this month
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </RechartsPieChart>
        </ChartContainer>
      </div>

      {/* Category breakdown list */}
      <div className="flex-1 min-h-0 overflow-auto space-y-2">
        {displayCategories.map((cat) => {
          const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
          const barWidth = total > 0 ? (cat.amount / maxAmount) * 100 : 0;
          return (
            <div key={cat.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-muted-foreground truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="tabular-nums text-foreground text-sm">
                    {formatCurrency(cat.amount)}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barWidth}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
