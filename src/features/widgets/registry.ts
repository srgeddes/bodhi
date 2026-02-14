import { type ComponentType } from "react";
import { Wallet, TrendingUp, PieChart, BarChart3, FileText, ArrowLeftRight, Calendar, Store, Target, Percent, Crosshair, Flame } from "lucide-react";

import { AccountBalancesWidget } from "@/features/widgets/account-balances/AccountBalancesWidget";
import { NetWorthWidget } from "@/features/widgets/net-worth/NetWorthWidget";
import { SpendingByCategoryWidget } from "@/features/widgets/spending-by-category/SpendingByCategoryWidget";
import { IncomeVsExpensesWidget } from "@/features/widgets/income-vs-expenses/IncomeVsExpensesWidget";
import { RecentTransactionsWidget } from "@/features/widgets/recent-transactions/RecentTransactionsWidget";
import { CashFlowWidget } from "@/features/widgets/cash-flow/CashFlowWidget";
import { MonthlySpendingTrendWidget } from "@/features/widgets/monthly-spending-trend/MonthlySpendingTrendWidget";
import { TopMerchantsWidget } from "@/features/widgets/top-merchants/TopMerchantsWidget";
import { BudgetOverviewWidget } from "@/features/widgets/budget-overview/BudgetOverviewWidget";
import { SavingsRateWidget } from "@/features/widgets/savings-rate/SavingsRateWidget";
import { CurrentBudgetWidget } from "@/features/widgets/current-budget/CurrentBudgetWidget";
import { FireCalculatorWidget } from "@/features/widgets/fire-calculator/FireCalculatorWidget";

export interface WidgetMeta {
  type: string;
  title: string;
  description: string;
  component: ComponentType<{ settings?: Record<string, unknown> }>;
  icon: ComponentType<{ className?: string }>;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
}

export const widgetRegistry: Record<string, WidgetMeta> = {
  "account-balances": {
    type: "account-balances",
    title: "Account Balances",
    description: "Overview of all connected account balances",
    component: AccountBalancesWidget,
    icon: Wallet,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 3, h: 3 },
  },
  "net-worth": {
    type: "net-worth",
    title: "Net Worth",
    description: "Track your total net worth over time",
    component: NetWorthWidget,
    icon: TrendingUp,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  "spending-by-category": {
    type: "spending-by-category",
    title: "Spending by Category",
    description: "Breakdown of spending across categories",
    component: SpendingByCategoryWidget,
    icon: PieChart,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  "income-vs-expenses": {
    type: "income-vs-expenses",
    title: "Income vs Expenses",
    description: "Compare monthly income and expenses",
    component: IncomeVsExpensesWidget,
    icon: BarChart3,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  "recent-transactions": {
    type: "recent-transactions",
    title: "Transactions",
    description: "Search, filter, and browse all your transactions",
    component: RecentTransactionsWidget,
    icon: FileText,
    defaultSize: { w: 12, h: 8 },
    minSize: { w: 8, h: 6 },
  },
  "cash-flow": {
    type: "cash-flow",
    title: "Cash Flow",
    description: "Daily inflow vs outflow over the last 30 days",
    component: CashFlowWidget,
    icon: ArrowLeftRight,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
  },
  "monthly-spending-trend": {
    type: "monthly-spending-trend",
    title: "Monthly Spending Trend",
    description: "Track your spending trend over the last 12 months",
    component: MonthlySpendingTrendWidget,
    icon: Calendar,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
  },
  "top-merchants": {
    type: "top-merchants",
    title: "Top Merchants",
    description: "Your most frequent merchants by spend",
    component: TopMerchantsWidget,
    icon: Store,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  "budget-overview": {
    type: "budget-overview",
    title: "Budget Overview",
    description: "Progress against your budget targets",
    component: BudgetOverviewWidget,
    icon: Target,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
  },
  "savings-rate": {
    type: "savings-rate",
    title: "Savings Rate",
    description: "Your savings rate with income and expense breakdown",
    component: SavingsRateWidget,
    icon: Percent,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  "current-budget": {
    type: "current-budget",
    title: "Current Budget",
    description: "Track your monthly spending against your budget",
    component: CurrentBudgetWidget,
    icon: Crosshair,
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
  },
  "fire-calculator": {
    type: "fire-calculator",
    title: "FIRE Calculator",
    description: "Calculate your Financial Independence, Retire Early target",
    component: FireCalculatorWidget,
    icon: Flame,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
};

export const widgetTypes = Object.keys(widgetRegistry);
