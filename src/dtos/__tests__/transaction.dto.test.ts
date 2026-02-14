import {
  TransactionFilterSchema,
  UpdateTransactionSchema,
  TransactionResponseSchema,
} from "@/dtos/transaction";

describe("Transaction DTOs", () => {
  describe("TransactionFilterSchema", () => {
    it("parses with defaults", () => {
      const result = TransactionFilterSchema.parse({});

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it("coerces date strings to Dates", () => {
      const result = TransactionFilterSchema.parse({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it("splits comma-separated accountIds", () => {
      const result = TransactionFilterSchema.parse({
        accountIds: "acc-1,acc-2,acc-3",
      });

      expect(result.accountIds).toEqual(["acc-1", "acc-2", "acc-3"]);
    });

    it("splits comma-separated categories", () => {
      const result = TransactionFilterSchema.parse({
        categories: "FOOD,TRANSPORT",
      });

      expect(result.categories).toEqual(["FOOD", "TRANSPORT"]);
    });

    it("accepts search string", () => {
      const result = TransactionFilterSchema.parse({
        search: "starbucks",
      });

      expect(result.search).toBe("starbucks");
    });

    it("rejects limit of 0", () => {
      expect(() => TransactionFilterSchema.parse({ limit: 0 })).toThrow();
    });
  });

  describe("UpdateTransactionSchema", () => {
    it("parses with all fields", () => {
      const result = UpdateTransactionSchema.parse({
        category: "FOOD_AND_DRINK",
        subcategory: "COFFEE",
        isExcluded: true,
        note: "My note",
      });

      expect(result.category).toBe("FOOD_AND_DRINK");
      expect(result.subcategory).toBe("COFFEE");
      expect(result.isExcluded).toBe(true);
      expect(result.note).toBe("My note");
    });

    it("allows partial updates", () => {
      const result = UpdateTransactionSchema.parse({
        note: "Just a note",
      });

      expect(result.note).toBe("Just a note");
      expect(result.category).toBeUndefined();
    });

    it("parses empty object", () => {
      const result = UpdateTransactionSchema.parse({});

      expect(result).toEqual({});
    });
  });

  describe("TransactionResponseSchema", () => {
    it("parses a valid transaction response", () => {
      const result = TransactionResponseSchema.parse({
        id: "txn-1",
        accountId: "acc-1",
        accountName: "Checking",
        amount: -45.99,
        currency: "USD",
        date: "2024-03-15",
        name: "STARBUCKS #1234",
        merchantName: "Starbucks",
        displayName: "Starbucks",
        category: "Food & Drink",
        subcategory: "Coffee",
        categoryConfidence: 0.92,
        categorySource: "AI",
        isTransfer: false,
        linkedTransferId: null,
        isPending: false,
        isRecurring: false,
        isExcluded: false,
        note: null,
        tellerType: "card_payment",
        tellerStatus: "posted",
        processingStatus: null,
        createdAt: "2024-03-15T12:00:00.000Z",
        updatedAt: "2024-03-15T12:00:00.000Z",
      });

      expect(result.id).toBe("txn-1");
      expect(result.amount).toBe(-45.99);
      expect(result.category).toBe("Food & Drink");
    });
  });
});
