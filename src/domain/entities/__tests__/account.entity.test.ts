import {
  BankAccount,
  CreditCardAccount,
  InvestmentAccount,
  LoanAccount,
  GenericAccount,
} from "../account.entity";
import { AccountType } from "@/domain/enums";
import { Money } from "@/domain/value-objects";

const BASE_PARAMS = {
  userId: "user-1",
  tellerEnrollmentId: "enrollment-1",
  tellerAccountId: "teller-acct-1",
  name: "My Account",
  type: AccountType.Other,
};

describe("BankAccount", () => {
  it("overrides type to AccountType.Depository", () => {
    const account = new BankAccount(BASE_PARAMS);
    expect(account.type).toBe(AccountType.Depository);
  });

  it("getDisplayBalance returns availableBalance when set", () => {
    const available = new Money(1500);
    const current = new Money(2000);
    const account = new BankAccount({
      ...BASE_PARAMS,
      availableBalance: available,
      currentBalance: current,
    });

    expect(account.getDisplayBalance()).toBe(available);
  });

  it("getDisplayBalance falls back to currentBalance when availableBalance is null", () => {
    const current = new Money(2000);
    const account = new BankAccount({
      ...BASE_PARAMS,
      currentBalance: current,
    });

    expect(account.getDisplayBalance()).toBe(current);
  });

  it("getDisplayBalance returns null when both balances are null", () => {
    const account = new BankAccount(BASE_PARAMS);
    expect(account.getDisplayBalance()).toBeNull();
  });
});

describe("CreditCardAccount", () => {
  it("overrides type to AccountType.Credit", () => {
    const account = new CreditCardAccount(BASE_PARAMS);
    expect(account.type).toBe(AccountType.Credit);
  });

  it("getDisplayBalance returns currentBalance", () => {
    const current = new Money(350);
    const account = new CreditCardAccount({
      ...BASE_PARAMS,
      currentBalance: current,
    });

    expect(account.getDisplayBalance()).toBe(current);
  });

  it("getAvailableCredit returns limit minus current balance", () => {
    const limit = new Money(5000);
    const current = new Money(1200);
    const account = new CreditCardAccount({
      ...BASE_PARAMS,
      limitAmount: limit,
      currentBalance: current,
    });

    const available = account.getAvailableCredit();
    expect(available).not.toBeNull();
    expect(available!.toNumber()).toBe(3800);
  });

  it("getAvailableCredit returns null when limitAmount is null", () => {
    const account = new CreditCardAccount({
      ...BASE_PARAMS,
      currentBalance: new Money(500),
    });

    expect(account.getAvailableCredit()).toBeNull();
  });

  it("getAvailableCredit returns null when currentBalance is null", () => {
    const account = new CreditCardAccount({
      ...BASE_PARAMS,
      limitAmount: new Money(5000),
    });

    expect(account.getAvailableCredit()).toBeNull();
  });
});

describe("InvestmentAccount", () => {
  it("overrides type to AccountType.Investment", () => {
    const account = new InvestmentAccount(BASE_PARAMS);
    expect(account.type).toBe(AccountType.Investment);
  });

  it("getDisplayBalance returns currentBalance", () => {
    const current = new Money(50000);
    const account = new InvestmentAccount({
      ...BASE_PARAMS,
      currentBalance: current,
    });

    expect(account.getDisplayBalance()).toBe(current);
  });
});

describe("LoanAccount", () => {
  it("overrides type to AccountType.Loan", () => {
    const account = new LoanAccount(BASE_PARAMS);
    expect(account.type).toBe(AccountType.Loan);
  });

  it("getDisplayBalance returns currentBalance", () => {
    const current = new Money(15000);
    const account = new LoanAccount({
      ...BASE_PARAMS,
      currentBalance: current,
    });

    expect(account.getDisplayBalance()).toBe(current);
  });
});

describe("GenericAccount", () => {
  it("getDisplayBalance returns currentBalance", () => {
    const current = new Money(750);
    const account = new GenericAccount({
      ...BASE_PARAMS,
      currentBalance: current,
    });

    expect(account.getDisplayBalance()).toBe(current);
  });
});

describe("Account defaults", () => {
  it("defaults isHidden to false", () => {
    const account = new BankAccount(BASE_PARAMS);
    expect(account.isHidden).toBe(false);
  });

  it("defaults currency to USD", () => {
    const account = new BankAccount(BASE_PARAMS);
    expect(account.currency).toBe("USD");
  });

  it("defaults lastSyncedAt to null", () => {
    const account = new BankAccount(BASE_PARAMS);
    expect(account.lastSyncedAt).toBeNull();
  });
});
