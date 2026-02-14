import { TransactionService } from "../transaction.service";
import { ForbiddenError } from "@/domain/errors";
import { Transaction } from "@/domain/entities";
import { CategorySource } from "@/domain/enums";
import { Money, ConfidenceScore } from "@/domain/value-objects";
import { ITransactionRepository } from "@/domain/interfaces/repositories";

function createMockTransactionRepository(): jest.Mocked<ITransactionRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findByUserId: jest.fn(),
    findByDateRange: jest.fn(),
    upsertByTellerTransactionId: jest.fn(),
    batchUpsertByTellerTransactionId: jest.fn(),
    deleteByTellerTransactionIds: jest.fn(),
    findNeedingReview: jest.fn(),
    countByUserId: jest.fn(),
    aggregateByUserId: jest.fn(),
    findSubscriptionMerchants: jest.fn(),
  };
}

function createTestTransaction(overrides?: Record<string, unknown>): Transaction {
  return new Transaction({
    id: "txn-1",
    userId: "user-1",
    accountId: "acc-1",
    tellerTransactionId: "teller-txn-1",
    amount: new Money(42.5, "USD"),
    date: new Date("2025-01-15"),
    name: "Coffee Shop",
    merchantName: "Best Coffee",
    category: "FOOD_AND_DRINK",
    categorySource: CategorySource.Teller,
    categoryConfidence: new ConfidenceScore(0.8),
    ...overrides,
  });
}

describe("TransactionService", () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    transactionRepository = createMockTransactionRepository();
    service = new TransactionService(transactionRepository);
  });

  describe("findByUserId", () => {
    it("returns transactions, total count, and aggregates in parallel", async () => {
      const transactions = [createTestTransaction()];
      const aggregates = { totalIncome: 100, totalExpenses: 42.5 };
      transactionRepository.findByUserId.mockResolvedValue(transactions);
      transactionRepository.countByUserId.mockResolvedValue(1);
      transactionRepository.aggregateByUserId.mockResolvedValue(aggregates);

      const result = await service.findByUserId("user-1", { limit: 50 });

      expect(result).toEqual({ transactions, total: 1, aggregates });
      expect(transactionRepository.findByUserId).toHaveBeenCalledWith("user-1", { limit: 50 });
      expect(transactionRepository.countByUserId).toHaveBeenCalledWith("user-1", { limit: 50 });
      expect(transactionRepository.aggregateByUserId).toHaveBeenCalledWith("user-1", { limit: 50 });
    });
  });

  describe("findByIdForUser", () => {
    it("returns transaction when owner matches", async () => {
      const txn = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(txn);

      const result = await service.findByIdForUser("txn-1", "user-1");

      expect(result).toEqual(txn);
      expect(transactionRepository.findById).toHaveBeenCalledWith("txn-1");
    });

    it("throws ForbiddenError when userId does not match", async () => {
      const txn = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(txn);

      await expect(service.findByIdForUser("txn-1", "other-user")).rejects.toThrow(
        ForbiddenError
      );
      await expect(service.findByIdForUser("txn-1", "other-user")).rejects.toThrow(
        "You do not have access to this transaction"
      );
    });
  });

  describe("updateTransaction", () => {
    it("sets category with UserOverride source and confidence 1.0", async () => {
      const txn = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(txn);
      const updatedTxn = createTestTransaction({
        category: "SHOPPING",
        subcategory: "CLOTHING",
        categorySource: CategorySource.UserOverride,
      });
      transactionRepository.update.mockResolvedValue(updatedTxn);

      const result = await service.updateTransaction("txn-1", "user-1", {
        category: "SHOPPING",
        subcategory: "CLOTHING",
      });

      expect(result).toEqual(updatedTxn);

      const updateCall = transactionRepository.update.mock.calls[0];
      expect(updateCall[0]).toBe("txn-1");

      const updateData = updateCall[1];
      expect(updateData).toMatchObject({
        category: "SHOPPING",
        subcategory: "CLOTHING",
        categorySource: CategorySource.UserOverride,
      });
      expect((updateData as Record<string, unknown>).categoryConfidence).toBeInstanceOf(
        ConfidenceScore
      );
      expect(
        ((updateData as Record<string, unknown>).categoryConfidence as ConfidenceScore).value
      ).toBe(1.0);
    });

    it("sets isExcluded when provided", async () => {
      const txn = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(txn);
      transactionRepository.update.mockResolvedValue(
        createTestTransaction({ isExcluded: true })
      );

      await service.updateTransaction("txn-1", "user-1", { isExcluded: true });

      const updateData = transactionRepository.update.mock.calls[0][1];
      expect(updateData).toMatchObject({ isExcluded: true });
    });

    it("sets note when provided", async () => {
      const txn = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(txn);
      transactionRepository.update.mockResolvedValue(
        createTestTransaction({ note: "Birthday dinner" })
      );

      await service.updateTransaction("txn-1", "user-1", { note: "Birthday dinner" });

      const updateData = transactionRepository.update.mock.calls[0][1];
      expect(updateData).toMatchObject({ note: "Birthday dinner" });
    });

    it("throws ForbiddenError when called by wrong user", async () => {
      const txn = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(txn);

      await expect(
        service.updateTransaction("txn-1", "other-user", { category: "SHOPPING" })
      ).rejects.toThrow(ForbiddenError);
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("findNeedingReview", () => {
    it("delegates to repository", async () => {
      const transactions = [createTestTransaction({ categoryConfidence: new ConfidenceScore(0.3) })];
      transactionRepository.findNeedingReview.mockResolvedValue(transactions);

      const result = await service.findNeedingReview("user-1");

      expect(result).toEqual(transactions);
      expect(transactionRepository.findNeedingReview).toHaveBeenCalledWith("user-1");
    });
  });
});
