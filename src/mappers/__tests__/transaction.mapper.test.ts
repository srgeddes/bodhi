import { TransactionMapper } from "@/mappers/transaction.mapper";
import { Transaction } from "@/domain/entities";
import { Money, ConfidenceScore } from "@/domain/value-objects";
import { CategorySource } from "@/domain/enums";

function createTransaction(
  overrides: {
    merchantName?: string | null;
    cleanMerchantName?: string | null;
    categoryConfidence?: ConfidenceScore | null;
    categorySource?: CategorySource | null;
  } = {}
): Transaction {
  return new Transaction({
    id: "txn-1",
    userId: "user-1",
    accountId: "acc-1",
    tellerTransactionId: "teller-txn-1",
    amount: new Money(50, "USD"),
    date: new Date("2024-06-15"),
    name: "STARBUCKS #1234",
    merchantName:
      "merchantName" in overrides ? overrides.merchantName : "STARBUCKS INC",
    cleanMerchantName:
      "cleanMerchantName" in overrides
        ? overrides.cleanMerchantName
        : "Starbucks",
    category: "Food & Drink",
    subcategory: "Coffee",
    categoryConfidence:
      "categoryConfidence" in overrides
        ? overrides.categoryConfidence
        : new ConfidenceScore(0.9),
    categorySource:
      "categorySource" in overrides
        ? overrides.categorySource
        : CategorySource.Ai,
  });
}

describe("TransactionMapper", () => {
  describe("toDomain", () => {
    it("creates Money and ConfidenceScore VOs from raw values", () => {
      const raw = {
        id: "txn-1",
        userId: "user-1",
        accountId: "acc-1",
        tellerTransactionId: "teller-txn-1",
        amount: 42.5,
        currency: "USD",
        date: "2024-06-15",
        name: "Starbucks",
        merchantName: "STARBUCKS INC",
        cleanMerchantName: "Starbucks",
        category: "FOOD_AND_DRINK",
        subcategory: "COFFEE",
        categoryConfidence: 0.9,
        categorySource: CategorySource.Ai,
        isTransfer: false,
        linkedTransferId: null,
        isPending: false,
        isRecurring: false,
        isExcluded: false,
        note: null,
        createdAt: "2024-06-15T00:00:00.000Z",
        updatedAt: "2024-06-15T00:00:00.000Z",
      };

      const txn = TransactionMapper.toDomain(raw);

      expect(txn).toBeInstanceOf(Transaction);
      expect(txn.amount).toBeInstanceOf(Money);
      expect(txn.amount.toNumber()).toBe(42.5);
      expect(txn.categoryConfidence).toBeInstanceOf(ConfidenceScore);
      expect(txn.categoryConfidence!.value).toBe(0.9);
    });

    it("handles null categoryConfidence", () => {
      const raw = {
        id: "txn-2",
        userId: "user-1",
        accountId: "acc-1",
        tellerTransactionId: "teller-txn-2",
        amount: -10,
        currency: "USD",
        date: "2024-07-01",
        name: "UNKNOWN",
        categoryConfidence: null,
        createdAt: "2024-07-01T00:00:00.000Z",
        updatedAt: "2024-07-01T00:00:00.000Z",
      };

      const txn = TransactionMapper.toDomain(raw);

      expect(txn.categoryConfidence).toBeNull();
    });
  });

  describe("toDto", () => {
    it("converts Money to number and uses getDisplayName", () => {
      const txn = createTransaction();
      const dto = TransactionMapper.toDto(txn);

      expect(typeof dto.amount).toBe("number");
      expect(dto.amount).toBe(50);
      // getDisplayName returns cleanMerchantName ?? merchantName ?? name
      expect(dto.displayName).toBe("Starbucks");
    });

    it("formats date as YYYY-MM-DD string", () => {
      const txn = createTransaction();
      const dto = TransactionMapper.toDto(txn);

      expect(dto.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("falls back through the display name chain", () => {
      const txn = createTransaction({
        cleanMerchantName: null,
        merchantName: null,
      });
      const dto = TransactionMapper.toDto(txn);

      expect(dto.displayName).toBe("STARBUCKS #1234");
    });

    it("outputs null for categoryConfidence when not set", () => {
      const txn = createTransaction({ categoryConfidence: null });
      const dto = TransactionMapper.toDto(txn);

      expect(dto.categoryConfidence).toBeNull();
    });
  });
});
