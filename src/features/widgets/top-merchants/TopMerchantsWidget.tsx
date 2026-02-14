"use client";

import { MerchantLogo } from "@/components/MerchantLogo";
import { useWidgetData } from "@/features/dashboard/hooks/useWidgetData";
import { formatCurrency } from "@/utils/format.utils";

interface MerchantSpend {
  name: string;
  amount: number;
  count: number;
}

function getChartColor(index: number): string {
  return `var(--chart-${(index % 5) + 1})`;
}

export function TopMerchantsWidget() {
  const { data } = useWidgetData("top-merchants");
  const merchants = (data as MerchantSpend[]) ?? [];

  const maxAmount = Math.max(...merchants.map((m) => m.amount), 1);
  const totalSpent = merchants.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="shrink-0">
        <p className="text-2xl font-bold tabular-nums tracking-tight">
          {formatCurrency(totalSpent)}
        </p>
        <p className="text-xs text-muted-foreground">
          {merchants.length} merchant{merchants.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {merchants.map((merchant, index) => {
          const percentage = totalSpent > 0
            ? Math.round((merchant.amount / totalSpent) * 100)
            : 0;
          const barWidth = (merchant.amount / maxAmount) * 100;

          return (
            <div key={merchant.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-xs text-muted-foreground tabular-nums text-right">
                    {index + 1}
                  </span>
                  <MerchantLogo merchantName={merchant.name} size={20} />
                  <div className="flex flex-col">
                    <span className="text-foreground leading-tight">
                      {merchant.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {merchant.count} transaction{merchant.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <span className="tabular-nums text-foreground whitespace-nowrap">
                  {formatCurrency(merchant.amount)} · {percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: getChartColor(index),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
