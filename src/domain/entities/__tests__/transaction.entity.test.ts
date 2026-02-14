import { Transaction } from "../transaction.entity";
import { Money, ConfidenceScore } from "@/domain/value-objects";
import { CategorySource } from "@/domain/enums";

function createTransaction(
  overrides: Partial<ConstructorParameters<typeof Transaction>[0]> = {}
): Transaction {
  return new Transaction({
    userId: "user-1",
    accountId: "account-1",
    tellerTransactionId: "teller-txn-1",
    amount: new Money(42.5),
    date: new Date("2025-01-15"),
    name: "AMAZON.COM",
    ...overrides,
  });
}

describe("Transaction", () => {
  describe("construction", () => {
    it("sets all required fields from constructor params", () => {
      const amount = new Money(99.99);
      const date = new Date("2025-03-01");
      const txn = createTransaction({ amount, date, name: "COFFEE SHOP" });

      expect(txn.userId).toBe("user-1");
      expect(txn.accountId).toBe("account-1");
      expect(txn.tellerTransactionId).toBe("teller-txn-1");
      expect(txn.amount).toBe(amount);
      expect(txn.date).toBe(date);
      expect(txn.name).toBe("COFFEE SHOP");
    });

    it("defaults optional fields to null or false", () => {
      const txn = createTransaction();

      expect(txn.merchantName).toBeNull();
      expect(txn.cleanMerchantName).toBeNull();
      expect(txn.category).toBeNull();
      expect(txn.subcategory).toBeNull();
      expect(txn.categoryConfidence).toBeNull();
      expect(txn.categorySource).toBeNull();
      expect(txn.isTransfer).toBe(false);
      expect(txn.linkedTransferId).toBeNull();
      expect(txn.isPending).toBe(false);
      expect(txn.isRecurring).toBe(false);
      expect(txn.isExcluded).toBe(false);
      expect(txn.note).toBeNull();
    });
  });

  describe("categorize", () => {
    it("sets category, subcategory, confidence, and source", () => {
      const txn = createTransaction();
      const confidence = new ConfidenceScore(0.92);

      txn.categorize("Food & Drink", "Coffee", confidence, CategorySource.Ai);

      expect(txn.category).toBe("Food & Drink");
      expect(txn.subcategory).toBe("Coffee");
      expect(txn.categoryConfidence).toBe(confidence);
      expect(txn.categorySource).toBe(CategorySource.Ai);
    });

    it("updates updatedAt timestamp", () => {
      const txn = createTransaction();
      const originalUpdatedAt = txn.updatedAt;

      txn.categorize("Shopping", null, new ConfidenceScore(0.85), CategorySource.Rule);

      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe("markAsTransfer", () => {
    it("sets isTransfer to true and assigns linkedTransferId", () => {
      const txn = createTransaction();

      txn.markAsTransfer("linked-txn-99");

      expect(txn.isTransfer).toBe(true);
      expect(txn.linkedTransferId).toBe("linked-txn-99");
    });

    it("handles null linkedTransferId", () => {
      const txn = createTransaction();

      txn.markAsTransfer(null);

      expect(txn.isTransfer).toBe(true);
      expect(txn.linkedTransferId).toBeNull();
    });

    it("updates updatedAt timestamp", () => {
      const txn = createTransaction();
      const originalUpdatedAt = txn.updatedAt;

      txn.markAsTransfer("linked-txn-99");

      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe("needsReview", () => {
    it("returns true when no category is set", () => {
      const txn = createTransaction();
      expect(txn.needsReview()).toBe(true);
    });

    it("returns true when category confidence is low", () => {
      const txn = createTransaction();
      txn.categorize("Shopping", null, new ConfidenceScore(0.3), CategorySource.Ai);
      expect(txn.needsReview()).toBe(true);
    });

    it("returns false when category is set with high confidence", () => {
      const txn = createTransaction();
      txn.categorize("Shopping", null, new ConfidenceScore(0.95), CategorySource.Ai);
      expect(txn.needsReview()).toBe(false);
    });

    it("returns false when category is set with medium confidence", () => {
      const txn = createTransaction();
      txn.categorize("Shopping", null, new ConfidenceScore(0.6), CategorySource.Ai);
      expect(txn.needsReview()).toBe(false);
    });
  });

  describe("getDisplayName", () => {
    it("returns cleanMerchantName when available", () => {
      const txn = createTransaction({
        merchantName: "AMZN MKTP US",
        cleanMerchantName: "Amazon",
      });
      expect(txn.getDisplayName()).toBe("Amazon");
    });

    it("falls back to merchantName when cleanMerchantName is null", () => {
      const txn = createTransaction({
        merchantName: "AMZN MKTP US",
      });
      expect(txn.getDisplayName()).toBe("AMZN MKTP US");
    });

    it("falls back to name when both merchant names are null", () => {
      const txn = createTransaction();
      expect(txn.getDisplayName()).toBe("AMAZON.COM");
    });
  });
});
