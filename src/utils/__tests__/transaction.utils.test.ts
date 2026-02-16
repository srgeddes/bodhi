import {
  isMisreportedExpense,
  classifyTransaction,
  isEffectiveTransfer,
  isTransferPayment,
  isBillPayment,
  computeAggregates,
  type TransactionFlow,
} from "@/utils/transaction.utils";

// ── isMisreportedExpense ──────────────────────────────────────────

describe("isMisreportedExpense", () => {
  it("detects BILT rent payment (compound word)", () => {
    expect(
      isMisreportedExpense({ amount: 1867.55, name: "BILT PAYMENT BILTRENT 260204" })
    ).toBe(true);
  });

  it("detects simple rent payment", () => {
    expect(
      isMisreportedExpense({ amount: 2000, name: "RENT PAYMENT" })
    ).toBe(true);
  });

  it("detects Zelle rent payment", () => {
    expect(
      isMisreportedExpense({ amount: 1500, name: "ZELLE RENT PAYMENT" })
    ).toBe(true);
  });

  it("detects mortgage autopay", () => {
    expect(
      isMisreportedExpense({ amount: 2500, name: "MORTGAGE AUTOPAY" })
    ).toBe(true);
  });

  it("detects student loan payment", () => {
    expect(
      isMisreportedExpense({ amount: 300, name: "STUDENT LOAN PMT" })
    ).toBe(true);
  });

  it("detects insurance payment", () => {
    expect(
      isMisreportedExpense({ amount: 150, name: "AUTO INSURANCE PAYMENT" })
    ).toBe(true);
  });

  it("detects by category alone", () => {
    expect(
      isMisreportedExpense({ amount: 1000, name: "UNKNOWN VENDOR", category: "rent" })
    ).toBe(true);
  });

  it("detects mortgage category", () => {
    expect(
      isMisreportedExpense({ amount: 2000, name: "BANK DRAFT", category: "Mortgage" })
    ).toBe(true);
  });

  it("does NOT flag negative amounts", () => {
    expect(
      isMisreportedExpense({ amount: -50, name: "RENT PAYMENT" })
    ).toBe(false);
  });

  it("does NOT flag zero amounts", () => {
    expect(
      isMisreportedExpense({ amount: 0, name: "RENT PAYMENT" })
    ).toBe(false);
  });

  it("does NOT flag names without payment keyword", () => {
    // "BRENT JOHNSON" has "rent" suffix but no payment keyword
    expect(
      isMisreportedExpense({ amount: 100, name: "BRENT JOHNSON" })
    ).toBe(false);
  });

  it("does NOT flag regular purchases", () => {
    expect(
      isMisreportedExpense({ amount: 50, name: "AMAZON PURCHASE" })
    ).toBe(false);
  });

  it("does NOT flag payroll", () => {
    expect(
      isMisreportedExpense({ amount: 3000, name: "ACME CORP PAYROLL" })
    ).toBe(false);
  });
});

// ── isTransferPayment ─────────────────────────────────────────────

describe("isTransferPayment", () => {
  it("detects credit card issuer + payment", () => {
    expect(isTransferPayment("Capital One Mobile Payment")).toBe(true);
    expect(isTransferPayment("CHASE AUTOPAY")).toBe(true);
    expect(isTransferPayment("AMEX PAYMENT")).toBe(true);
  });

  it("detects fintech issuers", () => {
    expect(isTransferPayment("BILT PAYMENT")).toBe(true);
    expect(isTransferPayment("AFFIRM AUTOPAY")).toBe(true);
    expect(isTransferPayment("KLARNA PAYMENT")).toBe(true);
  });

  it("detects generic credit card payment", () => {
    expect(isTransferPayment("Credit Card Payment")).toBe(true);
    expect(isTransferPayment("CC PMT")).toBe(true);
  });

  it("does NOT flag digital wallets", () => {
    expect(isTransferPayment("Apple Pay Purchase")).toBe(false);
    expect(isTransferPayment("Google Pay Transfer")).toBe(false);
  });

  it("does NOT flag regular purchases", () => {
    expect(isTransferPayment("AMAZON MARKETPLACE")).toBe(false);
  });

  it("isBillPayment is an alias for isTransferPayment", () => {
    expect(isBillPayment).toBe(isTransferPayment);
  });
});

// ── classifyTransaction ───────────────────────────────────────────

describe("classifyTransaction", () => {
  it("returns transfer for explicit isTransfer flag", () => {
    expect(
      classifyTransaction({ amount: 500, isTransfer: true, name: "TRANSFER" })
    ).toBe("transfer");
  });

  it("returns expense for misreported rent payment", () => {
    expect(
      classifyTransaction({ amount: 1867.55, name: "BILT PAYMENT BILTRENT 260204" })
    ).toBe("expense");
  });

  it("prioritizes misreported expense over transfer payment", () => {
    // BILT is in CARD_ISSUERS + has PAYMENT keyword → would be "transfer"
    // But it also has "rent" suffix → should be "expense" (checked first)
    expect(
      classifyTransaction({ amount: 1867.55, name: "BILT PAYMENT BILTRENT 260204" })
    ).toBe("expense");
  });

  it("returns transfer for credit card payment", () => {
    expect(
      classifyTransaction({ amount: 500, name: "CHASE AUTOPAY" })
    ).toBe("transfer");
  });

  it("returns income for positive amount with no special patterns", () => {
    expect(
      classifyTransaction({ amount: 3000, name: "ACME CORP PAYROLL" })
    ).toBe("income");
  });

  it("returns expense for negative amount", () => {
    expect(
      classifyTransaction({ amount: -50, name: "STARBUCKS" })
    ).toBe("expense");
  });

  it("returns transfer for zero amount", () => {
    expect(
      classifyTransaction({ amount: 0, name: "ADJUSTMENT" })
    ).toBe("transfer");
  });

  it("returns expense for category-based misreported expense", () => {
    expect(
      classifyTransaction({ amount: 2000, name: "BANK DRAFT", category: "rent" })
    ).toBe("expense");
  });
});

// ── isEffectiveTransfer (backwards compat wrapper) ────────────────

describe("isEffectiveTransfer", () => {
  it("returns true for explicit transfers", () => {
    expect(isEffectiveTransfer({ amount: 100, isTransfer: true, name: "X" })).toBe(true);
  });

  it("returns true for credit card payments", () => {
    expect(isEffectiveTransfer({ amount: 500, name: "CHASE AUTOPAY" })).toBe(true);
  });

  it("returns false for misreported expenses (they're expenses, not transfers)", () => {
    expect(
      isEffectiveTransfer({ amount: 1867.55, name: "BILT PAYMENT BILTRENT 260204" })
    ).toBe(false);
  });

  it("returns false for normal income", () => {
    expect(isEffectiveTransfer({ amount: 3000, name: "PAYROLL" })).toBe(false);
  });

  it("returns false for normal expenses", () => {
    expect(isEffectiveTransfer({ amount: -50, name: "GROCERY" })).toBe(false);
  });
});

// ── computeAggregates ─────────────────────────────────────────────

describe("computeAggregates", () => {
  it("correctly aggregates simple income and expenses", () => {
    const result = computeAggregates([
      { amount: 3000, name: "PAYROLL" },
      { amount: -50, name: "GROCERIES" },
      { amount: -100, name: "UTILITIES" },
    ]);
    expect(result.totalIncome).toBe(3000);
    expect(result.totalExpenses).toBe(150);
  });

  it("excludes transfers from totals", () => {
    const result = computeAggregates([
      { amount: 3000, name: "PAYROLL" },
      { amount: 500, isTransfer: true, name: "TRANSFER" },
      { amount: -50, name: "GROCERIES" },
    ]);
    expect(result.totalIncome).toBe(3000);
    expect(result.totalExpenses).toBe(50);
  });

  it("counts misreported expenses as expenses (not income)", () => {
    const result = computeAggregates([
      { amount: 3000, name: "PAYROLL" },
      { amount: 1867.55, name: "BILT PAYMENT BILTRENT 260204" },
      { amount: -50, name: "GROCERIES" },
    ]);
    expect(result.totalIncome).toBe(3000);
    expect(result.totalExpenses).toBeCloseTo(1917.55);
  });

  it("excludes credit card payments as transfers", () => {
    const result = computeAggregates([
      { amount: 3000, name: "PAYROLL" },
      { amount: 500, name: "CHASE AUTOPAY" },
      { amount: -50, name: "GROCERIES" },
    ]);
    expect(result.totalIncome).toBe(3000);
    expect(result.totalExpenses).toBe(50);
  });

  it("returns zeros for empty list", () => {
    const result = computeAggregates([]);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
  });
});
