"use client";

import { Plus, Wallet, PieChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { useDashboardStore } from "@/store/dashboard.store";
import { toast } from "sonner";

const quickWidgets = [
  { type: "account-balances", title: "Account Balances", icon: Wallet, description: "See all your balances at a glance" },
  { type: "spending-by-category", title: "Spending by Category", icon: PieChart, description: "Breakdown of where your money goes" },
  { type: "recent-transactions", title: "Recent Transactions", icon: FileText, description: "Your latest transactions" },
];

interface CreateFirstWidgetPromptProps {
  onOpenLibrary: () => void;
}

export function CreateFirstWidgetPrompt({ onOpenLibrary }: CreateFirstWidgetPromptProps) {
  const addWidget = useDashboardStore((s) => s.addWidget);

  const handleQuickAdd = (type: string, title: string) => {
    addWidget(type, title);
    toast.success(`${title} added`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <BlurFade delay={0.1}>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Your accounts are connected
        </h2>
        <p className="text-muted-foreground mb-8">
          Now build your view. Start with a widget.
        </p>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div className="grid gap-3 sm:grid-cols-3 mb-8 max-w-2xl">
          {quickWidgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <Card
                key={widget.type}
                className="flex flex-col items-center gap-3 p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleQuickAdd(widget.type, widget.title)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{widget.title}</p>
                <p className="text-xs text-muted-foreground">{widget.description}</p>
              </Card>
            );
          })}
        </div>
      </BlurFade>

      <BlurFade delay={0.3}>
        <Button variant="outline" onClick={onOpenLibrary}>
          <Plus className="h-4 w-4" />
          Browse all widgets
        </Button>
      </BlurFade>
    </div>
  );
}
