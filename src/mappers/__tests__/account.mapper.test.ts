import { AccountMapper } from "@/mappers/account.mapper";
import {
  BankAccount,
  CreditCardAccount,
  InvestmentAccount,
} from "@/domain/entities";
import { AccountType } from "@/domain/enums";
import { Money } from "@/domain/value-objects";

function createBankAccount(
  overrides: {
    currentBalance?: Money | null;
    availableBalance?: Money | null;
  } = {}
): BankAccount {
  return new BankAccount({
    id: "acc-1",
    userId: "user-1",
    tellerEnrollmentId: "enrollment-1",
    tellerAccountId: "teller-acc-1",
    name: "Checking",
    officialName: "Premium Checking",
    type: AccountType.Depository,
    subtype: "checking",
    mask: "1234",
    currentBalance:
      "currentBalance" in overrides
        ? overrides.currentBalance
        : new Money(1000, "USD"),
    availableBalance:
      "availableBalance" in overrides
        ? overrides.availableBalance
        : new Money(900, "USD"),
    currency: "USD",
  });
}

describe("AccountMapper", () => {
  describe("toDomain", () => {
    it("creates BankAccount for Depository type", () => {
      const raw = {
        id: "acc-1",
        userId: "user-1",
        tellerEnrollmentId: "enrollment-1",
        tellerAccountId: "teller-acc-1",
        name: "Checking",
        officialName: null,
        type: AccountType.Depository,
        subtype: "checking",
        mask: "1234",
        currentBalance: 1000,
        availableBalance: 900,
        limitAmount: null,
        currency: "USD",
        isHidden: false,
        lastSyncedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const account = AccountMapper.toDomain(raw);

      expect(account).toBeInstanceOf(BankAccount);
      expect(account.type).toBe(AccountType.Depository);
    });

    it("creates CreditCardAccount for Credit type", () => {
      const raw = {
        id: "acc-2",
        userId: "user-1",
        tellerEnrollmentId: "enrollment-1",
        tellerAccountId: "teller-acc-2",
        name: "Credit Card",
        officialName: null,
        type: AccountType.Credit,
        subtype: "credit card",
        mask: "5678",
        currentBalance: 500,
        availableBalance: null,
        limitAmount: 5000,
        currency: "USD",
        isHidden: false,
        lastSyncedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const account = AccountMapper.toDomain(raw);

      expect(account).toBeInstanceOf(CreditCardAccount);
      expect(account.type).toBe(AccountType.Credit);
    });

    it("converts numeric values to Money VOs", () => {
      const raw = {
        id: "acc-1",
        userId: "user-1",
        tellerEnrollmentId: "enrollment-1",
        tellerAccountId: "teller-acc-1",
        name: "Checking",
        officialName: null,
        type: AccountType.Depository,
        subtype: null,
        mask: null,
        currentBalance: 1234.56,
        availableBalance: null,
        limitAmount: null,
        currency: "USD",
        isHidden: false,
        lastSyncedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const account = AccountMapper.toDomain(raw);

      expect(account.currentBalance).toBeInstanceOf(Money);
      expect(account.currentBalance!.toNumber()).toBe(1234.56);
    });

    it("handles null balances without errors", () => {
      const raw = {
        id: "acc-3",
        userId: "user-1",
        tellerEnrollmentId: "enrollment-1",
        tellerAccountId: "teller-acc-3",
        name: "Empty",
        type: AccountType.Depository,
        currentBalance: null,
        availableBalance: null,
        limitAmount: null,
        currency: "USD",
        isHidden: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const account = AccountMapper.toDomain(raw);

      expect(account.currentBalance).toBeNull();
      expect(account.availableBalance).toBeNull();
    });
  });

  describe("toDto", () => {
    it("converts Money to number and includes displayBalance", () => {
      const account = createBankAccount();
      const dto = AccountMapper.toDto(account);

      expect(typeof dto.currentBalance).toBe("number");
      expect(dto.currentBalance).toBe(1000);
      expect(dto.availableBalance).toBe(900);
      // BankAccount.getDisplayBalance() returns availableBalance ?? currentBalance
      expect(dto.displayBalance).toBe(900);
    });

    it("handles null balances", () => {
      const account = createBankAccount({
        currentBalance: null,
        availableBalance: null,
      });
      const dto = AccountMapper.toDto(account);

      expect(dto.currentBalance).toBeNull();
      expect(dto.availableBalance).toBeNull();
      expect(dto.displayBalance).toBeNull();
    });
  });

  describe("toPersistence", () => {
    it("converts Money values to Decimal objects", () => {
      const account = createBankAccount();
      const persistence = AccountMapper.toPersistence(account);

      expect(persistence.currentBalance).toBeDefined();
      expect(persistence.availableBalance).toBeDefined();
      expect(persistence.id).toBe("acc-1");
    });
  });
});
