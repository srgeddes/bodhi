import { AccountService } from "../account.service";
import { ForbiddenError } from "@/domain/errors";
import { BankAccount } from "@/domain/entities";
import { AccountType } from "@/domain/enums";
import { Money } from "@/domain/value-objects";
import { IAccountRepository } from "@/domain/interfaces/repositories";

function createMockAccountRepository(): jest.Mocked<IAccountRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdWithInstitution: jest.fn(),
    findByEnrollmentId: jest.fn(),
    findByTellerAccountId: jest.fn(),
    upsertByTellerAccountId: jest.fn(),
  };
}

function createTestAccount(overrides?: Record<string, unknown>): BankAccount {
  return new BankAccount({
    id: "acc-1",
    userId: "user-1",
    tellerEnrollmentId: "enrollment-1",
    tellerAccountId: "teller-acc-1",
    name: "Checking",
    type: AccountType.Depository,
    currentBalance: new Money(1000, "USD"),
    ...overrides,
  });
}

describe("AccountService", () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<IAccountRepository>;

  beforeEach(() => {
    accountRepository = createMockAccountRepository();
    service = new AccountService(accountRepository);
  });

  describe("findByUserId", () => {
    it("delegates to repository", async () => {
      const accounts = [createTestAccount()];
      accountRepository.findByUserId.mockResolvedValue(accounts);

      const result = await service.findByUserId("user-1");

      expect(result).toEqual(accounts);
      expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-1");
    });
  });

  describe("findByIdForUser", () => {
    it("returns account when the owner matches", async () => {
      const account = createTestAccount();
      accountRepository.findById.mockResolvedValue(account);

      const result = await service.findByIdForUser("acc-1", "user-1");

      expect(result).toEqual(account);
      expect(accountRepository.findById).toHaveBeenCalledWith("acc-1");
    });

    it("throws ForbiddenError when userId does not match", async () => {
      const account = createTestAccount();
      accountRepository.findById.mockResolvedValue(account);

      await expect(service.findByIdForUser("acc-1", "other-user")).rejects.toThrow(
        ForbiddenError
      );
      await expect(service.findByIdForUser("acc-1", "other-user")).rejects.toThrow(
        "You do not have access to this account"
      );
    });
  });

  describe("hideAccount", () => {
    it("updates isHidden to true for the correct owner", async () => {
      const account = createTestAccount();
      accountRepository.findById.mockResolvedValue(account);
      const hiddenAccount = createTestAccount({ isHidden: true });
      accountRepository.update.mockResolvedValue(hiddenAccount);

      const result = await service.hideAccount("acc-1", "user-1");

      expect(result).toEqual(hiddenAccount);
      expect(accountRepository.update).toHaveBeenCalledWith("acc-1", { isHidden: true });
    });

    it("throws ForbiddenError when called by wrong user", async () => {
      const account = createTestAccount();
      accountRepository.findById.mockResolvedValue(account);

      await expect(service.hideAccount("acc-1", "other-user")).rejects.toThrow(ForbiddenError);
      expect(accountRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("unhideAccount", () => {
    it("updates isHidden to false for the correct owner", async () => {
      const account = createTestAccount({ isHidden: true });
      accountRepository.findById.mockResolvedValue(account);
      const unhiddenAccount = createTestAccount({ isHidden: false });
      accountRepository.update.mockResolvedValue(unhiddenAccount);

      const result = await service.unhideAccount("acc-1", "user-1");

      expect(result).toEqual(unhiddenAccount);
      expect(accountRepository.update).toHaveBeenCalledWith("acc-1", { isHidden: false });
    });

    it("throws ForbiddenError when called by wrong user", async () => {
      const account = createTestAccount();
      accountRepository.findById.mockResolvedValue(account);

      await expect(service.unhideAccount("acc-1", "other-user")).rejects.toThrow(ForbiddenError);
      expect(accountRepository.update).not.toHaveBeenCalled();
    });
  });
});
