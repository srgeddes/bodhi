/**
 * Centralized income/expense logic.
 *
 * App convention (matches demo data, widgets, chat API):
 *   negative amount = expense (money out)
 *   positive amount = income  (money in)
 *
 * Teller amounts are negated during sync so this convention holds
 * for all stored transaction data.
 */

export function isIncome(amount: number): boolean {
  return amount > 0;
}

export function isExpense(amount: number): boolean {
  return amount < 0;
}

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
