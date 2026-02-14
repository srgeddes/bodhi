"use client";

import { useState, useMemo } from "react";
import { Settings2, Flame, TrendingUp } from "lucide-react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency, formatCompactNumber } from "@/utils/format.utils";

interface FireData {
  currentNetWorth: number;
  monthlySavings: number;
  monthlyExpenses: number;
  monthlyIncome: number;
}

interface Projection {
  age: number;
  value: number;
}

const DEFAULTS = { age: 28, annualReturn: 7 };

function calculateFIRE(
  currentAge: number,
  currentNetWorth: number,
  monthlySavings: number,
  annualExpenses: number,
  annualReturn: number,
) {
  const fireNumber = annualExpenses * 25;
  const monthlyReturn = annualReturn / 100 / 12;
  let balance = currentNetWorth;
  let months = 0;
  const projections: Projection[] = [{ age: currentAge, value: balance }];

  while (balance < fireNumber && months < 600) {
    balance = balance * (1 + monthlyReturn) + monthlySavings;
    months++;
    if (months % 12 === 0) {
      projections.push({ age: currentAge + months / 12, value: Math.round(balance) });
    }
  }

  if (months < 600 && months % 12 !== 0) {
    projections.push({ age: Math.round((currentAge + months / 12) * 10) / 10, value: Math.round(balance) });
  }

  // Also project milestones (10yr, 20yr, 30yr)
  const milestones: { label: string; value: number }[] = [];
  for (const years of [10, 20, 30]) {
    let b = currentNetWorth;
    for (let m = 0; m < years * 12; m++) {
      b = b * (1 + monthlyReturn) + monthlySavings;
    }
    milestones.push({ label: `${years}yr`, value: Math.round(b) });
  }

  return {
    retireAge: Math.round(currentAge + months / 12),
    yearsToFire: Math.round(months / 12),
    fireNumber,
    projections,
    milestones,
    reachedFire: months < 600,
  };
}

const chartConfig = {
  value: {
    label: "Projected Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function FireCalculatorWidget({ settings }: { settings?: Record<string, unknown> }) {
  const { data } = useWidgetData("fire-calculator");
  const fireData = data as FireData | null;

  // Settings — use widget config, fall back to defaults
  const initialAge = (settings?.age as number) ?? DEFAULTS.age;
  const initialReturn = (settings?.annualReturn as number) ?? DEFAULTS.annualReturn;

  const [age, setAge] = useState(initialAge.toString());
  const [returnRate, setReturnRate] = useState(initialReturn.toString());

  if (!fireData) return null;

  const currentAge = parseInt(age) || DEFAULTS.age;
  const annualReturn = parseFloat(returnRate) || DEFAULTS.annualReturn;
  const annualExpenses = fireData.monthlyExpenses * 12;

  const result = useMemo(() => {
    return calculateFIRE(
      currentAge,
      fireData.currentNetWorth,
      fireData.monthlySavings,
      annualExpenses,
      annualReturn,
    );
  }, [currentAge, fireData.currentNetWorth, fireData.monthlySavings, annualExpenses, annualReturn]);

  const progressPct = result.fireNumber > 0
    ? Math.min((fireData.currentNetWorth / result.fireNumber) * 100, 100)
    : 0;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[var(--warning-text)]" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              FIRE Projection
            </span>
          </div>
          {result.reachedFire ? (
            <>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-0.5">
                Retire at {result.retireAge}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.yearsToFire} years away &middot; Target {formatCurrency(result.fireNumber)}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground mt-0.5">Keep going</p>
              <p className="text-xs text-muted-foreground">
                Target {formatCurrency(result.fireNumber)} at {formatCurrency(fireData.monthlySavings)}/mo
              </p>
            </>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <p className="text-xs font-medium">Assumptions</p>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Your age</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Annual return (%)</label>
                <Input
                  type="number"
                  value={returnRate}
                  onChange={(e) => setReturnRate(e.target.value)}
                  className="h-8"
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Expenses &amp; savings are pulled from your accounts automatically.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* What you're on track for */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Saving</p>
          <p className="text-sm font-semibold tabular-nums text-[var(--success-text)]">
            {formatCurrency(fireData.monthlySavings)}/mo
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Net Worth</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(fireData.currentNetWorth)}
          </p>
        </div>
      </div>

      {/* Progress toward FIRE */}
      <div className="shrink-0 space-y-0.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{progressPct.toFixed(0)}% to FIRE</span>
          <span>{formatCurrency(result.fireNumber)}</span>
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Projection chart */}
      <div className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full [aspect-ratio:unset]">
          <RechartsAreaChart data={result.projections} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fire-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={45}
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => formatCompactNumber(v)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `Age ${label}`}
                />
              }
            />
            <ReferenceLine
              y={result.fireNumber}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill="url(#fire-gradient)"
              strokeWidth={2}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </div>

      {/* Milestone projections */}
      <div className="grid grid-cols-3 gap-2 shrink-0 pt-1 border-t border-border/50">
        {result.milestones.map((m) => (
          <div key={m.label}>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">In {m.label}</p>
            <p className="text-xs font-semibold tabular-nums text-foreground">
              {formatCompactNumber(m.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
