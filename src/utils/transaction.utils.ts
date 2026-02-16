/**
 * Centralized income/expense/transfer classification logic.
 *
 * App convention (matches demo data, widgets, chat API):
 *   negative amount = expense (money out)
 *   positive amount = income  (money in)
 *
 * Teller amounts are negated during sync so this convention holds
 * for all stored transaction data.
 *
 * Some transactions arrive with the wrong sign — e.g. rent payments
 * reported as positive (income) when they're actually expenses.
 * `classifyTransaction` is the single source of truth that handles
 * these edge cases.
 */

// ── Types ─────────────────────────────────────────────────────────

export type TransactionFlow = "income" | "expense" | "transfer";

// ── Simple sign helpers (kept for backwards compat) ───────────────

export function isIncome(amount: number): boolean {
  return amount > 0;
}

export function isExpense(amount: number): boolean {
  return amount < 0;
}

// ── Bill / payment detection ──────────────────────────────────────

/** Common card issuer names (lowercase). */
const CARD_ISSUERS = [
  "capital one", "capitalone", "chase", "citi", "citibank",
  "amex", "american express", "discover", "wells fargo",
  "bank of america", "barclays", "synchrony", "us bank",
  "usaa", "navy federal", "pnc", "td bank", "ally",
  "goldman sachs", "sofi", "apple card",
  "bilt", "affirm", "klarna", "afterpay",
];

/** Keywords that indicate a payment action (not a purchase). */
const PAYMENT_KEYWORDS = /\b(payment|pymt|pmt|autopay|auto pay|bill pay|pay)\b/i;

/**
 * Detects whether a transaction name looks like a credit card or internal
 * account payment (→ gray transfer display).
 *
 * e.g. "Capital One Mobile Payment", "Amex Autopay", "Credit Card Payment"
 *
 * Deliberately excludes digital wallets like "Apple Pay", "Google Pay".
 */
export function isTransferPayment(name: string): boolean {
  const lower = name.toLowerCase();

  // Skip digital wallet false positives
  if (/\b(apple pay|google pay|samsung pay|android pay)\b/.test(lower)) {
    return false;
  }

  // Issuer name + payment keyword → credit card payment
  if (CARD_ISSUERS.some((issuer) => lower.includes(issuer)) && PAYMENT_KEYWORDS.test(lower)) {
    return true;
  }

  // Generic "credit card payment", "card payment", "cc payment"
  if (/\b(credit\s*card|cc|card)\s*(payment|pymt|pmt)\b/i.test(lower)) {
    return true;
  }

  return false;
}

/** @deprecated Use `isTransferPayment` instead. */
export const isBillPayment = isTransferPayment;

// ── Misreported expense detection ─────────────────────────────────

/** Categories that are inherently expenses — never income regardless of sign. */
const EXPENSE_CATEGORIES = new Set([
  "rent", "mortgage", "loan", "insurance", "utilities",
  "tuition", "car payment", "student loan",
]);

/**
 * Expense keywords as suffixes — no word boundary before, boundary after.
 * Catches compound names like "BILTRENT" where "rent" lacks a leading \b.
 */
const EXPENSE_NAME_SUFFIX = /(?:rent|mortgage|loan|insurance|tuition|lease)\b/i;

/**
 * Detects positive-amount transactions that are actually expenses.
 * Uses keyword + category analysis — no hardcoded service names.
 */
export function isMisreportedExpense(txn: {
  amount: number;
  name: string;
  category?: string | null;
}): boolean {
  if (txn.amount <= 0) return false;

  // Category is inherently an expense (Teller-provided)
  if (txn.category && EXPENSE_CATEGORIES.has(txn.category.toLowerCase())) return true;

  // Name contains expense keyword (suffix match) + payment keyword → expense
  if (EXPENSE_NAME_SUFFIX.test(txn.name) && PAYMENT_KEYWORDS.test(txn.name)) return true;

  return false;
}

// ── Central classification ────────────────────────────────────────

/**
 * Single source of truth for transaction classification.
 *
 * Three flows:
 * - **income** (green ↗): genuine money received — payroll, interest, refunds
 * - **expense** (red ↘): real spending — rent, groceries, subscriptions
 * - **transfer** (gray ↔): money between own accounts — CC payments, transfers
 */
export function classifyTransaction(txn: {
  amount: number;
  isTransfer?: boolean;
  name: string;
  category?: string | null;
}): TransactionFlow {
  // 1. Explicit transfer flag from sync
  if (txn.isTransfer) return "transfer";

  // 2. Positive amount that's actually an expense (rent, mortgage, etc.)
  if (isMisreportedExpense(txn)) return "expense";

  // 3. Credit card / internal payment detection (→ gray transfer)
  if (txn.amount > 0 && isTransferPayment(txn.name)) return "transfer";

  // 4. Sign-based fallback
  if (txn.amount > 0) return "income";
  if (txn.amount < 0) return "expense";
  return "transfer"; // zero
}

/**
 * Whether a transaction should be treated as a transfer for display purposes.
 * @deprecated Use `classifyTransaction(txn) === "transfer"` instead.
 */
export function isEffectiveTransfer(txn: {
  isTransfer?: boolean;
  amount: number;
  name: string;
  category?: string | null;
}): boolean {
  return classifyTransaction(txn) === "transfer";
}

// ── Amount helpers ─────────────────────────────────────────────────

/** Absolute value for display — always positive. */
export function displayAmount(amount: number): number {
  return Math.abs(amount);
}

/** Sign prefix for display: "+" for income, "−" (unicode minus) for expense. */
export function amountSign(amount: number): string {
  if (amount > 0) return "+";
  if (amount < 0) return "\u2212";
  return "";
}

// ── Aggregate helpers ─────────────────────────────────────────────

/**
 * Compute income/expense aggregates from a list of transactions,
 * excluding transfers so the totals reflect real cash flow.
 * Uses classifyTransaction to correctly handle misreported signs.
 */
export function computeAggregates(
  transactions: { amount: number; isTransfer?: boolean; name: string; category?: string | null }[]
): { totalIncome: number; totalExpenses: number } {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const txn of transactions) {
    const flow = classifyTransaction(txn);
    if (flow === "transfer") continue;
    if (flow === "income") totalIncome += Math.abs(txn.amount);
    if (flow === "expense") totalExpenses += Math.abs(txn.amount);
  }

  return { totalIncome, totalExpenses };
}
