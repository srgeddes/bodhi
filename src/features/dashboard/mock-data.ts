import { formatMonthShort } from "@/utils/date.utils";

export type MockDataType =
  | "account-balances"
  | "net-worth"
  | "spending-by-category"
  | "income-vs-expenses"
  | "recent-transactions"
  | "cash-flow"
  | "monthly-spending-trend"
  | "top-merchants"
  | "budget-overview"
  | "savings-rate"
  | "fire-calculator";

const mockAccounts = [
  { id: "a1", name: "Chase Checking", type: "DEPOSITORY", balance: 4825.67, institution: "Chase", mask: "4521" },
  { id: "a2", name: "Chase Savings", type: "DEPOSITORY", balance: 12340.50, institution: "Chase", mask: "7832" },
  { id: "a3", name: "Amex Platinum", type: "CREDIT", balance: -2150.30, institution: "American Express", mask: "1008" },
  { id: "a4", name: "Vanguard Brokerage", type: "INVESTMENT", balance: 45820.00, institution: "Vanguard", mask: "9912" },
  { id: "a5", name: "Student Loan", type: "LOAN", balance: -18500.00, institution: "Nelnet", mask: "3344" },
];

function generateMonthlyData() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: formatMonthShort(d),
      date: d.toISOString(),
    });
  }
  return months;
}

const monthlyData = generateMonthlyData();

const netWorthHistory = (() => {
  let assets = 58000;
  let liabilities = 20650;
  return monthlyData.map((m, i) => {
    assets += 600 + Math.floor(Math.random() * 800 - 200);
    liabilities -= 100 + Math.floor(Math.random() * 150 - 50);
    if (liabilities < 0) liabilities = 0;
    return {
      month: m.month,
      value: assets - liabilities,
      assets: Math.round(assets),
      liabilities: Math.round(liabilities),
    };
  });
})();

const netWorthData = {
  current: netWorthHistory[netWorthHistory.length - 1].value,
  previous: netWorthHistory[netWorthHistory.length - 2].value,
  assets: netWorthHistory[netWorthHistory.length - 1].assets,
  liabilities: netWorthHistory[netWorthHistory.length - 1].liabilities,
  history: netWorthHistory,
};

const spendingByCategory = [
  { name: "Food & Dining", amount: 680, color: "var(--chart-1)" },
  { name: "Housing", amount: 1850, color: "var(--chart-2)" },
  { name: "Transportation", amount: 320, color: "var(--chart-3)" },
  { name: "Shopping", amount: 450, color: "var(--chart-4)" },
  { name: "Entertainment", amount: 180, color: "var(--chart-5)" },
  { name: "Health", amount: 120, color: "var(--chart-6)" },
  { name: "Other", amount: 290, color: "var(--chart-7)" },
];

const incomeVsExpenses = monthlyData.slice(6).map((m) => ({
  month: m.month,
  income: 5200 + Math.floor(Math.random() * 800),
  expenses: 3400 + Math.floor(Math.random() * 1200),
}));

const recentTransactions = [
  { id: "t1", date: "2026-02-06", merchant: "Whole Foods Market", category: "Food & Dining", amount: -87.43, isPending: false },
  { id: "t2", date: "2026-02-05", merchant: "Netflix", category: "Entertainment", amount: -15.99, isPending: false },
  { id: "t3", date: "2026-02-05", merchant: "Shell Gas Station", category: "Transportation", amount: -52.10, isPending: false },
  { id: "t4", date: "2026-02-04", merchant: "Amazon", category: "Shopping", amount: -34.99, isPending: true },
  { id: "t5", date: "2026-02-04", merchant: "Direct Deposit — Employer", category: "Income", amount: 2600.00, isPending: false },
  { id: "t6", date: "2026-02-03", merchant: "Starbucks", category: "Food & Dining", amount: -6.45, isPending: false },
  { id: "t7", date: "2026-02-02", merchant: "Target", category: "Shopping", amount: -63.21, isPending: false },
  { id: "t8", date: "2026-02-01", merchant: "Planet Fitness", category: "Health & Fitness", amount: -24.99, isPending: false },
  { id: "t9", date: "2026-02-01", merchant: "Spotify", category: "Entertainment", amount: -9.99, isPending: false },
  { id: "t10", date: "2026-01-31", merchant: "Trader Joe's", category: "Food & Dining", amount: -45.67, isPending: false },
];

function generateDailyData() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayOfMonth = d.getDate();
    const isPayday = dayOfMonth === 1 || dayOfMonth === 15;
    const isRentDay = dayOfMonth === 1;
    const inflow = isPayday ? 2600 + Math.floor(Math.random() * 200) : Math.floor(Math.random() * 120);
    const outflow = (isRentDay ? 1850 : 0) + Math.floor(Math.random() * 150 + 40);
    days.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      inflow,
      outflow,
    });
  }
  return days;
}

const cashFlowData = generateDailyData();

const monthlySpendingTrend = monthlyData.map((m) => ({
  month: m.month,
  amount: 3000 + Math.floor(Math.random() * 1500),
}));

const topMerchants = [
  { name: "Whole Foods", amount: 425, count: 12 },
  { name: "Amazon", amount: 380, count: 8 },
  { name: "Target", amount: 290, count: 6 },
  { name: "Starbucks", amount: 185, count: 15 },
  { name: "Shell", amount: 160, count: 7 },
  { name: "Netflix", amount: 96, count: 6 },
  { name: "Spotify", amount: 60, count: 6 },
  { name: "Planet Fitness", amount: 50, count: 6 },
];

const budgetOverview = [
  { category: "Food & Dining", budgeted: 800, spent: 680, color: "var(--chart-1)" },
  { category: "Housing", budgeted: 1900, spent: 1850, color: "var(--chart-2)" },
  { category: "Transportation", budgeted: 400, spent: 320, color: "var(--chart-3)" },
  { category: "Shopping", budgeted: 350, spent: 450, color: "var(--chart-4)" },
  { category: "Entertainment", budgeted: 200, spent: 180, color: "var(--chart-5)" },
  { category: "Health", budgeted: 150, spent: 120, color: "var(--chart-6)" },
];

const savingsRateData = {
  income: 5200,
  expenses: 3890,
  saved: 1310,
  rate: 0.252,
  previousRate: 0.231,
};

const fireCalculatorData = {
  currentNetWorth: netWorthData.current,
  monthlySavings: 1310,
  monthlyExpenses: 3890,
  monthlyIncome: 5200,
};

const dataMap: Record<MockDataType, unknown> = {
  "account-balances": mockAccounts,
  "net-worth": netWorthData,
  "spending-by-category": spendingByCategory,
  "income-vs-expenses": incomeVsExpenses,
  "recent-transactions": recentTransactions,
  "cash-flow": cashFlowData,
  "monthly-spending-trend": monthlySpendingTrend,
  "top-merchants": topMerchants,
  "budget-overview": budgetOverview,
  "savings-rate": savingsRateData,
  "fire-calculator": fireCalculatorData,
};

export function getMockData(type: MockDataType): unknown {
  return dataMap[type] ?? null;
}
