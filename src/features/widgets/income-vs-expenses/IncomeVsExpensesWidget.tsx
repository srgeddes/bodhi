"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency, formatCompactNumber } from "@/utils/format.utils";

interface MonthlyComparison {
  month: string;
  income: number;
  expenses: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-income)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-expense)",
  },
} satisfies ChartConfig;

export function IncomeVsExpensesWidget() {
  const { data } = useWidgetData("income-vs-expenses");
  const months = (data as MonthlyComparison[]) ?? [];

  const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
  const totalNet = totalIncome - totalExpenses;
  const avgNet = months.length > 0 ? totalNet / months.length : 0;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Three-column summary stats */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Income</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--success-text)]">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Expenses</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--error-text)]">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Net</p>
          <p className={`text-sm font-semibold tabular-nums ${totalNet >= 0 ? "text-[var(--success-text)]" : "text-[var(--error-text)]"}`}>
            {totalNet >= 0 ? "+" : ""}{formatCurrency(totalNet)}
          </p>
        </div>
      </div>

      {/* Period label */}
      <p className="text-xs text-muted-foreground shrink-0">Last {months.length} months</p>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full [aspect-ratio:unset]">
          <RechartsBarChart data={months} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
                  formatter={(value, name) => {
                    return formatCurrency(value as number);
                  }}
                />
              }
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[4, 4, 0, 0]}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
          </RechartsBarChart>
        </ChartContainer>
      </div>

      {/* Bottom note */}
      <p className="text-xs text-muted-foreground shrink-0">
        Avg. monthly net:{" "}
        <span className={`font-medium ${avgNet >= 0 ? "text-[var(--success-text)]" : "text-[var(--error-text)]"}`}>
          {avgNet >= 0 ? "+" : ""}{formatCurrency(avgNet)}
        </span>
      </p>
    </div>
  );
}
