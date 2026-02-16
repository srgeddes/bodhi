import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { BCRYPT_ROUNDS } from "@/config/constants";

const DEMO_EMAIL = "demo@bodhi.app";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Alex Demo";

// Seeded PRNG for consistent data
function createRng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
}

function between(rng: () => number, min: number, max: number): number {
  return Math.round((min + rng() * (max - min)) * 100) / 100;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ──────────────────────────────────────────────
// Institution & Account definitions
// ──────────────────────────────────────────────

const ENROLLMENTS = [
  { id: "demo_enroll_chase", enrollmentId: "enr_demo_chase", institutionName: "Chase", accessToken: "demo_token_chase" },
  { id: "demo_enroll_amex", enrollmentId: "enr_demo_amex", institutionName: "American Express", accessToken: "demo_token_amex" },
  { id: "demo_enroll_vanguard", enrollmentId: "enr_demo_vanguard", institutionName: "Vanguard", accessToken: "demo_token_vanguard" },
  { id: "demo_enroll_citi", enrollmentId: "enr_demo_citi", institutionName: "Citi", accessToken: "demo_token_citi" },
] as const;

const ACCOUNTS = [
  {
    id: "demo_acct_chase_checking",
    enrollmentIdx: 0,
    tellerAccountId: "demo_ta_chase_chk",
    name: "Chase Total Checking",
    officialName: "Chase Total Checking",
    type: "DEPOSITORY" as const,
    subtype: "checking",
    mask: "4921",
    currentBalance: 5102.33,
    availableBalance: 4825.67,
    institutionId: "chase",
  },
  {
    id: "demo_acct_chase_savings",
    enrollmentIdx: 0,
    tellerAccountId: "demo_ta_chase_sav",
    name: "Chase Savings",
    officialName: "Chase Premier Savings",
    type: "DEPOSITORY" as const,
    subtype: "savings",
    mask: "7803",
    currentBalance: 12340.5,
    availableBalance: 12340.5,
    institutionId: "chase",
  },
  {
    id: "demo_acct_amex_plat",
    enrollmentIdx: 1,
    tellerAccountId: "demo_ta_amex_plat",
    name: "Amex Platinum",
    officialName: "American Express Platinum Card",
    type: "CREDIT" as const,
    subtype: "credit_card",
    mask: "1008",
    currentBalance: 2150.3,
    availableBalance: null,
    limitAmount: 15000,
    institutionId: "amex",
  },
  {
    id: "demo_acct_citi_double",
    enrollmentIdx: 3,
    tellerAccountId: "demo_ta_citi_dc",
    name: "Citi Double Cash",
    officialName: "Citi Double Cash Card",
    type: "CREDIT" as const,
    subtype: "credit_card",
    mask: "5542",
    currentBalance: 847.22,
    availableBalance: null,
    limitAmount: 8000,
    institutionId: "citi",
  },
  {
    id: "demo_acct_vanguard",
    enrollmentIdx: 2,
    tellerAccountId: "demo_ta_vanguard",
    name: "Vanguard Brokerage",
    officialName: "Vanguard Individual Brokerage",
    type: "INVESTMENT" as const,
    subtype: "brokerage",
    mask: "3317",
    currentBalance: 45820.0,
    availableBalance: null,
    institutionId: "vanguard",
  },
  {
    id: "demo_acct_student_loan",
    enrollmentIdx: 3,
    tellerAccountId: "demo_ta_loan",
    name: "Federal Student Loan",
    officialName: "Federal Direct Unsubsidized Loan",
    type: "LOAN" as const,
    subtype: "student",
    mask: "9901",
    currentBalance: 18500.0,
    availableBalance: null,
    institutionId: "fedloan",
  },
];

// ──────────────────────────────────────────────
// Transaction Templates
// ──────────────────────────────────────────────

interface TxnTemplate {
  name: string;
  merchantName: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  accountIdx: number; // index into ACCOUNTS
  isIncome?: boolean;
}

const RECURRING_MONTHLY: (TxnTemplate & { day: number })[] = [
  { day: 1, name: "Rent Payment", merchantName: "Skyline Apartments", category: "accommodation", minAmount: 1850, maxAmount: 1850, accountIdx: 0 },
  { day: 1, name: "Netflix", merchantName: "Netflix", category: "entertainment", minAmount: 15.99, maxAmount: 15.99, accountIdx: 2 },
  { day: 1, name: "Spotify Premium", merchantName: "Spotify", category: "entertainment", minAmount: 10.99, maxAmount: 10.99, accountIdx: 2 },
  { day: 1, name: "Planet Fitness", merchantName: "Planet Fitness", category: "gym", minAmount: 24.99, maxAmount: 24.99, accountIdx: 2 },
  { day: 3, name: "Electric Bill", merchantName: "ConEdison", category: "utilities", minAmount: 85, maxAmount: 145, accountIdx: 0 },
  { day: 5, name: "Xfinity Internet", merchantName: "Xfinity", category: "utilities", minAmount: 79.99, maxAmount: 79.99, accountIdx: 0 },
  { day: 8, name: "T-Mobile Bill", merchantName: "T-Mobile", category: "phone", minAmount: 85, maxAmount: 85, accountIdx: 0 },
  { day: 10, name: "Geico Auto Insurance", merchantName: "GEICO", category: "insurance", minAmount: 118, maxAmount: 122, accountIdx: 0 },
  { day: 15, name: "iCloud Storage", merchantName: "Apple", category: "software", minAmount: 2.99, maxAmount: 2.99, accountIdx: 2 },
  { day: 18, name: "YouTube Premium", merchantName: "Google", category: "entertainment", minAmount: 13.99, maxAmount: 13.99, accountIdx: 3 },
  { day: 20, name: "Student Loan Payment", merchantName: "FedLoan Servicing", category: "loan", minAmount: 350, maxAmount: 350, accountIdx: 0 },
  { day: 22, name: "Hulu", merchantName: "Hulu", category: "entertainment", minAmount: 17.99, maxAmount: 17.99, accountIdx: 3 },
];

const BIWEEKLY_INCOME: TxnTemplate = {
  name: "Direct Deposit - Payroll", merchantName: "ACME Corp Payroll", category: "income",
  minAmount: 3250, maxAmount: 3250, accountIdx: 0, isIncome: true,
};

const WEEKLY_TEMPLATES: TxnTemplate[] = [
  // Groceries (2x week)
  { name: "Whole Foods Market", merchantName: "Whole Foods", category: "groceries", minAmount: 45, maxAmount: 130, accountIdx: 2 },
  { name: "Trader Joe's", merchantName: "Trader Joe's", category: "groceries", minAmount: 28, maxAmount: 75, accountIdx: 3 },
  // Gas (1x week)
  { name: "Shell Gas Station", merchantName: "Shell", category: "fuel", minAmount: 35, maxAmount: 62, accountIdx: 0 },
  // Coffee (3x week)
  { name: "Starbucks", merchantName: "Starbucks", category: "dining", minAmount: 4.5, maxAmount: 7.95, accountIdx: 2 },
  { name: "Starbucks", merchantName: "Starbucks", category: "dining", minAmount: 5.25, maxAmount: 8.5, accountIdx: 3 },
  { name: "Blue Bottle Coffee", merchantName: "Blue Bottle Coffee", category: "dining", minAmount: 5, maxAmount: 7, accountIdx: 2 },
  // Dining (2x week)
  { name: "Chipotle", merchantName: "Chipotle Mexican Grill", category: "dining", minAmount: 11.5, maxAmount: 16.8, accountIdx: 2 },
  { name: "DoorDash", merchantName: "DoorDash", category: "dining", minAmount: 18, maxAmount: 48, accountIdx: 3 },
];

const RANDOM_TEMPLATES: TxnTemplate[] = [
  { name: "Amazon.com", merchantName: "Amazon", category: "shopping", minAmount: 12, maxAmount: 165, accountIdx: 2 },
  { name: "Amazon.com", merchantName: "Amazon", category: "shopping", minAmount: 8, maxAmount: 89, accountIdx: 3 },
  { name: "Target", merchantName: "Target", category: "shopping", minAmount: 15, maxAmount: 95, accountIdx: 2 },
  { name: "Uber", merchantName: "Uber", category: "transport", minAmount: 8, maxAmount: 32, accountIdx: 0 },
  { name: "Lyft", merchantName: "Lyft", category: "transport", minAmount: 10, maxAmount: 28, accountIdx: 0 },
  { name: "CVS Pharmacy", merchantName: "CVS", category: "health", minAmount: 8, maxAmount: 52, accountIdx: 3 },
  { name: "AMC Theatres", merchantName: "AMC", category: "entertainment", minAmount: 14, maxAmount: 32, accountIdx: 2 },
  { name: "Barnes & Noble", merchantName: "Barnes & Noble", category: "shopping", minAmount: 12, maxAmount: 35, accountIdx: 3 },
  { name: "Nike.com", merchantName: "Nike", category: "clothing", minAmount: 45, maxAmount: 180, accountIdx: 2 },
  { name: "Costco", merchantName: "Costco", category: "groceries", minAmount: 80, maxAmount: 220, accountIdx: 0 },
  { name: "Home Depot", merchantName: "Home Depot", category: "home", minAmount: 15, maxAmount: 120, accountIdx: 0 },
  { name: "Walgreens", merchantName: "Walgreens", category: "health", minAmount: 6, maxAmount: 30, accountIdx: 3 },
  { name: "Apple Store", merchantName: "Apple", category: "electronics", minAmount: 29, maxAmount: 199, accountIdx: 2 },
  { name: "Uber Eats", merchantName: "Uber Eats", category: "dining", minAmount: 15, maxAmount: 45, accountIdx: 2 },
  { name: "Steam Games", merchantName: "Steam", category: "entertainment", minAmount: 5, maxAmount: 60, accountIdx: 3 },
  { name: "Zara", merchantName: "Zara", category: "clothing", minAmount: 35, maxAmount: 120, accountIdx: 3 },
  { name: "Sephora", merchantName: "Sephora", category: "shopping", minAmount: 20, maxAmount: 85, accountIdx: 2 },
  { name: "Parking Meter", merchantName: "ParkMobile", category: "transport", minAmount: 3, maxAmount: 15, accountIdx: 0 },
  { name: "Doctor Copay", merchantName: "CityHealth Medical", category: "health", minAmount: 25, maxAmount: 50, accountIdx: 0 },
  { name: "Dry Cleaning", merchantName: "Prestige Cleaners", category: "service", minAmount: 15, maxAmount: 35, accountIdx: 0 },
  { name: "Grubhub", merchantName: "Grubhub", category: "dining", minAmount: 20, maxAmount: 55, accountIdx: 3 },
  { name: "The Cheesecake Factory", merchantName: "Cheesecake Factory", category: "dining", minAmount: 35, maxAmount: 75, accountIdx: 2 },
  { name: "Olive Garden", merchantName: "Olive Garden", category: "dining", minAmount: 25, maxAmount: 60, accountIdx: 2 },
  { name: "Best Buy", merchantName: "Best Buy", category: "electronics", minAmount: 20, maxAmount: 250, accountIdx: 3 },
  { name: "TJ Maxx", merchantName: "TJ Maxx", category: "clothing", minAmount: 18, maxAmount: 65, accountIdx: 3 },
  { name: "REI", merchantName: "REI", category: "shopping", minAmount: 30, maxAmount: 150, accountIdx: 2 },
  { name: "Petco", merchantName: "Petco", category: "shopping", minAmount: 12, maxAmount: 60, accountIdx: 3 },
];

const TRANSFER_TEMPLATES = [
  { name: "Transfer to Savings", merchantName: "Chase Transfer", category: "transfer", amount: 500, fromIdx: 0, toIdx: 1 },
  { name: "Amex Payment", merchantName: "Amex Card Payment", category: "transfer", amount: 1200, fromIdx: 0, toIdx: 2 },
  { name: "Citi Payment", merchantName: "Citi Card Payment", category: "transfer", amount: 600, fromIdx: 0, toIdx: 3 },
];

// ──────────────────────────────────────────────
// Generation
// ──────────────────────────────────────────────

function generateTransactions(userId: string, monthsBack: number) {
  const rng = createRng(42);
  const txns: Array<{
    id: string;
    userId: string;
    accountId: string;
    tellerTransactionId: string;
    amount: number;
    currency: string;
    date: Date;
    name: string;
    merchantName: string;
    cleanMerchantName: string;
    category: string;
    categorySource: "TELLER";
    isTransfer: boolean;
    isPending: boolean;
    tellerType: string;
    tellerStatus: string;
  }> = [];

  let txnIdx = 0;
  const now = new Date();

  for (let m = monthsBack; m >= 0; m--) {
    const year = now.getFullYear();
    const month = now.getMonth() - m;
    const monthDate = new Date(year, month, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const isCurrentMonth = m === 0;
    const maxDay = isCurrentMonth ? now.getDate() : daysInMonth;

    // Recurring monthly bills
    for (const rec of RECURRING_MONTHLY) {
      if (rec.day > maxDay) continue;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), rec.day);
      const amount = between(rng, rec.minAmount, rec.maxAmount);
      txns.push(makeTxn(userId, rec, -amount, date, txnIdx++, rng));
    }

    // Biweekly income (1st and 15th)
    for (const payDay of [1, 15]) {
      if (payDay > maxDay) continue;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), payDay);
      txns.push(makeTxn(userId, BIWEEKLY_INCOME, BIWEEKLY_INCOME.minAmount, date, txnIdx++, rng));
    }

    // Weekly patterns
    for (let week = 0; week < 4; week++) {
      const weekStart = week * 7 + 1;
      for (const tmpl of WEEKLY_TEMPLATES) {
        const day = weekStart + Math.floor(rng() * 6);
        if (day > maxDay) continue;
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(day, daysInMonth));
        const amount = between(rng, tmpl.minAmount, tmpl.maxAmount);
        txns.push(makeTxn(userId, tmpl, -amount, date, txnIdx++, rng));
      }
    }

    // Random transactions (8-15 per month)
    const randomCount = 8 + Math.floor(rng() * 8);
    for (let r = 0; r < randomCount; r++) {
      const tmpl = pick(rng, RANDOM_TEMPLATES);
      const day = 1 + Math.floor(rng() * (maxDay - 1));
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const amount = between(rng, tmpl.minAmount, tmpl.maxAmount);
      txns.push(makeTxn(userId, tmpl, -amount, date, txnIdx++, rng));
    }

    // Transfers (1st and 15th)
    for (const payDay of [2, 16]) {
      if (payDay > maxDay) continue;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), payDay);
      for (const tr of TRANSFER_TEMPLATES) {
        // Outgoing from checking
        txns.push({
          id: `demo_txn_${txnIdx}`,
          userId,
          accountId: ACCOUNTS[tr.fromIdx].id,
          tellerTransactionId: `demo_ttxn_${txnIdx++}`,
          amount: -tr.amount,
          currency: "USD",
          date,
          name: tr.name,
          merchantName: tr.merchantName,
          cleanMerchantName: tr.merchantName,
          category: tr.category,
          categorySource: "TELLER",
          isTransfer: true,
          isPending: false,
          tellerType: "transfer",
          tellerStatus: "posted",
        });
      }
    }

    // Occasional bonus income (freelance, refund)
    if (rng() > 0.6) {
      const day = 10 + Math.floor(rng() * 15);
      if (day <= maxDay) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(day, daysInMonth));
        const bonusTemplates = [
          { name: "Venmo Payment", merchantName: "Venmo", category: "income", amount: between(rng, 20, 150) },
          { name: "Amazon Refund", merchantName: "Amazon", category: "shopping", amount: between(rng, 15, 80) },
          { name: "Freelance Payment", merchantName: "Upwork", category: "income", amount: between(rng, 200, 800) },
        ];
        const bonus = pick(rng, bonusTemplates);
        txns.push({
          id: `demo_txn_${txnIdx}`,
          userId,
          accountId: ACCOUNTS[0].id,
          tellerTransactionId: `demo_ttxn_${txnIdx++}`,
          amount: bonus.amount,
          currency: "USD",
          date,
          name: bonus.name,
          merchantName: bonus.merchantName,
          cleanMerchantName: bonus.merchantName,
          category: bonus.category,
          categorySource: "TELLER",
          isTransfer: false,
          isPending: false,
          tellerType: "income",
          tellerStatus: "posted",
        });
      }
    }
  }

  // Mark last 3 transactions as pending if they're from today or yesterday
  const recentTxns = txns
    .filter((t) => {
      const diff = now.getTime() - t.date.getTime();
      return diff < 2 * 24 * 60 * 60 * 1000;
    })
    .slice(-3);
  for (const t of recentTxns) {
    t.isPending = true;
    t.tellerStatus = "pending";
  }

  return txns;
}

function makeTxn(
  userId: string,
  tmpl: TxnTemplate,
  amount: number,
  date: Date,
  idx: number,
  _rng: () => number,
) {
  return {
    id: `demo_txn_${idx}`,
    userId,
    accountId: ACCOUNTS[tmpl.accountIdx].id,
    tellerTransactionId: `demo_ttxn_${idx}`,
    amount,
    currency: "USD",
    date,
    name: tmpl.name,
    merchantName: tmpl.merchantName,
    cleanMerchantName: tmpl.merchantName,
    category: tmpl.category,
    categorySource: "TELLER" as const,
    isTransfer: false,
    isPending: false,
    tellerType: tmpl.isIncome ? "income" : "card_payment",
    tellerStatus: "posted",
  };
}

// ──────────────────────────────────────────────
// Main seed function
// ──────────────────────────────────────────────

export const DEMO_USER_EMAIL = DEMO_EMAIL;

export async function seedDemoUser(): Promise<string> {
  // Check if demo user already exists
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) return existing.id;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      id: "demo_user",
      email: DEMO_EMAIL,
      passwordHash,
      name: DEMO_NAME,
      emailVerified: true,
      isDemo: true,
      monthlyBudget: 4000,
      dashboardLayout: {
        widgets: [
          { id: "w1", type: "net-worth", title: "Net Worth", settings: {} },
          { id: "w2", type: "current-budget", title: "Current Budget", settings: {} },
          { id: "w3", type: "recent-transactions", title: "This Month's Transactions", settings: {} },
        ],
        layout: [
          { i: "w1", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
          { i: "w2", x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
          { i: "w3", x: 0, y: 4, w: 12, h: 5, minW: 6, minH: 4 },
        ],
      },
    },
  });

  // Create enrollments
  for (const enr of ENROLLMENTS) {
    await prisma.tellerEnrollment.create({
      data: {
        id: enr.id,
        userId: user.id,
        accessToken: enr.accessToken,
        enrollmentId: enr.enrollmentId,
        institutionName: enr.institutionName,
        status: "ACTIVE",
        lastSyncedAt: new Date(),
        lastSyncedDate: new Date(),
      },
    });
  }

  // Create accounts
  for (const acct of ACCOUNTS) {
    await prisma.account.create({
      data: {
        id: acct.id,
        userId: user.id,
        tellerEnrollmentId: ENROLLMENTS[acct.enrollmentIdx].id,
        tellerAccountId: acct.tellerAccountId,
        name: acct.name,
        officialName: acct.officialName,
        type: acct.type,
        subtype: acct.subtype,
        mask: acct.mask,
        currentBalance: acct.currentBalance,
        availableBalance: acct.availableBalance ?? null,
        limitAmount: ("limitAmount" in acct ? acct.limitAmount : null) as number | null,
        currency: "USD",
        institutionId: acct.institutionId,
        lastSyncedAt: new Date(),
      },
    });
  }

  // Generate and insert transactions
  const txns = generateTransactions(user.id, 6);

  // Use createMany for performance (batch of 500)
  const BATCH = 500;
  for (let i = 0; i < txns.length; i += BATCH) {
    const batch = txns.slice(i, i + BATCH);
    await prisma.transaction.createMany({
      data: batch.map((t) => ({
        id: t.id,
        userId: t.userId,
        accountId: t.accountId,
        tellerTransactionId: t.tellerTransactionId,
        amount: t.amount,
        currency: t.currency,
        date: t.date,
        name: t.name,
        merchantName: t.merchantName,
        cleanMerchantName: t.cleanMerchantName,
        category: t.category,
        categorySource: t.categorySource,
        isTransfer: t.isTransfer,
        isPending: t.isPending,
        tellerType: t.tellerType,
        tellerStatus: t.tellerStatus,
      })),
    });
  }

  return user.id;
}
