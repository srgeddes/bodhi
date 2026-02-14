import { TellerEnrollmentService } from "../teller-enrollment.service";
import { TellerService } from "../teller.service";
import { AccountService } from "../account.service";
import { TransactionService } from "../transaction.service";
import { TellerEnrollment } from "@/domain/entities";
import { EnrollmentStatus } from "@/domain/enums";
import { ITellerEnrollmentRepository } from "@/domain/interfaces/repositories";
import { encrypt, decrypt } from "@/lib/encryption";

jest.mock("@/lib/encryption", () => ({
  encrypt: jest.fn().mockReturnValue("encrypted_token"),
  decrypt: jest.fn().mockReturnValue("decrypted_access_token"),
}));

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("@/config/constants", () => ({
  TRANSACTION_SYNC_LOOKBACK_DAYS: 90,
  TRANSACTION_SYNC_OVERLAP_DAYS: 7,
}));

function createMockTellerEnrollmentRepository(): jest.Mocked<ITellerEnrollmentRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findByEnrollmentId: jest.fn(),
    findByUserId: jest.fn(),
    findActiveByUserId: jest.fn(),
    findAllActive: jest.fn(),
    updateLastSyncedDate: jest.fn(),
  };
}

function createMockTellerService(): jest.Mocked<TellerService> {
  return {
    getAccounts: jest.fn(),
    getAccountBalances: jest.fn(),
    getTransactions: jest.fn(),
  } as unknown as jest.Mocked<TellerService>;
}

function createMockAccountService(): jest.Mocked<AccountService> {
  return {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByEnrollmentId: jest.fn(),
    upsertByTellerAccountId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<AccountService>;
}

function createMockTransactionService(): jest.Mocked<TransactionService> {
  return {
    findById: jest.fn(),
    upsertByTellerTransactionId: jest.fn(),
    batchUpsertByTellerTransactionId: jest.fn(),
    deleteByTellerTransactionIds: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<TransactionService>;
}

function createTestEnrollment(overrides?: Record<string, unknown>): TellerEnrollment {
  return new TellerEnrollment({
    id: "enrollment-1",
    userId: "user-1",
    accessToken: "encrypted_token",
    enrollmentId: "enrollment-sandbox-abc",
    institutionName: "Chase",
    status: EnrollmentStatus.Active,
    ...overrides,
  });
}

describe("TellerEnrollmentService", () => {
  let service: TellerEnrollmentService;
  let enrollmentRepository: jest.Mocked<ITellerEnrollmentRepository>;
  let tellerService: jest.Mocked<TellerService>;
  let accountService: jest.Mocked<AccountService>;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    enrollmentRepository = createMockTellerEnrollmentRepository();
    tellerService = createMockTellerService();
    accountService = createMockAccountService();
    transactionService = createMockTransactionService();
    service = new TellerEnrollmentService(
      enrollmentRepository,
      tellerService,
      accountService,
      transactionService
    );
  });

  describe("connectAccount", () => {
    it("encrypts access token, creates enrollment, and fetches accounts", async () => {
      const createdEnrollment = createTestEnrollment();
      enrollmentRepository.create.mockResolvedValue(createdEnrollment);
      tellerService.getAccounts.mockResolvedValue([
        {
          id: "teller-acc-1",
          name: "Checking",
          type: "depository",
          subtype: "checking",
          last_four: "1234",
          currency: "USD",
          enrollment_id: "enrollment-sandbox-abc",
          institution: { name: "Chase", id: "chase" },
        },
      ] as never);
      tellerService.getAccountBalances.mockResolvedValue({
        account_id: "teller-acc-1",
        ledger: "1000.00",
        available: "900.00",
      } as never);
      accountService.upsertByTellerAccountId.mockResolvedValue({} as never);
      accountService.findByUserId.mockResolvedValue([]);

      const result = await service.connectAccount("user-1", {
        accessToken: "access-token-xyz",
        enrollmentId: "enrollment-sandbox-abc",
        institutionName: "Chase",
      });

      expect(encrypt).toHaveBeenCalledWith("access-token-xyz");
      expect(enrollmentRepository.create).toHaveBeenCalled();
      expect(tellerService.getAccounts).toHaveBeenCalledWith("access-token-xyz");
      expect(accountService.upsertByTellerAccountId).toHaveBeenCalled();
      expect(result.enrollment).toEqual(createdEnrollment);
    });
  });

  describe("syncTransactions", () => {
    it("decrypts token, fetches transactions, and updates last synced date", async () => {
      const enrollment = createTestEnrollment();
      enrollmentRepository.findById.mockResolvedValue(enrollment);
      accountService.findByEnrollmentId.mockResolvedValue([
        {
          id: "acc-1",
          tellerEnrollmentId: "enrollment-1",
          tellerAccountId: "teller-acc-1",
          userId: "user-1",
          currency: "USD",
        },
      ] as never);
      tellerService.getTransactions.mockResolvedValue([
        {
          id: "teller-txn-1",
          account_id: "teller-acc-1",
          amount: "-25.50",
          date: "2025-01-15",
          description: "Coffee Shop",
          details: { category: "food", counterparty: { name: "Best Coffee" }, processing_status: "complete" },
          status: "posted",
          type: "card_payment",
        },
      ] as never);
      tellerService.getAccountBalances.mockResolvedValue({
        account_id: "teller-acc-1",
        ledger: "1000.00",
        available: "900.00",
      } as never);
      transactionService.batchUpsertByTellerTransactionId.mockResolvedValue({ succeeded: 1, failed: 0 });

      await service.syncTransactions("enrollment-1");

      expect(decrypt).toHaveBeenCalledWith("encrypted_token");
      expect(accountService.findByEnrollmentId).toHaveBeenCalledWith("enrollment-1");
      expect(tellerService.getTransactions).toHaveBeenCalled();
      expect(transactionService.batchUpsertByTellerTransactionId).toHaveBeenCalled();
      expect(enrollmentRepository.updateLastSyncedDate).toHaveBeenCalledWith(
        "enrollment-1",
        expect.any(Date)
      );
    });
  });

  describe("handleWebhook", () => {
    it("sets status to Disconnected for enrollment.disconnected", async () => {
      const enrollment = createTestEnrollment();
      enrollmentRepository.findByEnrollmentId.mockResolvedValue(enrollment);

      await service.handleWebhook("enrollment.disconnected", "enrollment-sandbox-abc");

      expect(enrollmentRepository.findByEnrollmentId).toHaveBeenCalledWith("enrollment-sandbox-abc");
      expect(enrollmentRepository.update).toHaveBeenCalledWith("enrollment-1", {
        status: EnrollmentStatus.Disconnected,
      });
    });

    it("triggers sync for transactions.processed", async () => {
      const enrollment = createTestEnrollment();
      enrollmentRepository.findByEnrollmentId.mockResolvedValue(enrollment);
      enrollmentRepository.findById.mockResolvedValue(enrollment);
      accountService.findByEnrollmentId.mockResolvedValue([]);

      await service.handleWebhook("transactions.processed", "enrollment-sandbox-abc");

      expect(enrollmentRepository.findById).toHaveBeenCalledWith("enrollment-1");
    });

    it("logs a warning and returns gracefully for an unknown enrollment", async () => {
      enrollmentRepository.findByEnrollmentId.mockResolvedValue(null);
      const { logger } = require("@/lib/logger");

      await service.handleWebhook("transactions.processed", "unknown-enrollment");

      expect(logger.warn).toHaveBeenCalledWith("Webhook for unknown enrollment", {
        enrollmentId: "unknown-enrollment",
        eventType: "transactions.processed",
      });
      expect(enrollmentRepository.update).not.toHaveBeenCalled();
    });
  });
});
