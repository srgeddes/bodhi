import { AccountFactory } from "@/factories/account.factory";
import {
  BankAccount,
  CreditCardAccount,
  InvestmentAccount,
  LoanAccount,
  GenericAccount,
} from "@/domain/entities";
import { Money } from "@/domain/value-objects";

interface TellerAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  last_four: string | null;
  currency: string;
  enrollment_id: string;
  institution: { name: string; id: string };
}

interface TellerBalance {
  account_id: string;
  ledger: string | null;
  available: string | null;
}

function mockTellerAccount(type: string): TellerAccount {
  return {
    id: "teller-acc-1",
    name: "Test Account",
    type,
    subtype: "checking",
    last_four: "1234",
    currency: "USD",
    enrollment_id: "enrollment-1",
    institution: { name: "Chase", id: "chase" },
  };
}

function mockTellerBalance(
  overrides: Partial<TellerBalance> = {}
): TellerBalance {
  return {
    account_id: "teller-acc-1",
    ledger: "1000.00",
    available: "900.00",
    ...overrides,
  };
}

const USER_ID = "user-1";
const ENROLLMENT_ID = "enrollment-1";

describe("AccountFactory", () => {
  it("creates BankAccount for depository type", () => {
    const account = AccountFactory.createFromTeller(
      mockTellerAccount("depository"),
      mockTellerBalance(),
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account).toBeInstanceOf(BankAccount);
  });

  it("creates CreditCardAccount for credit type", () => {
    const account = AccountFactory.createFromTeller(
      mockTellerAccount("credit"),
      mockTellerBalance(),
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account).toBeInstanceOf(CreditCardAccount);
  });

  it("creates GenericAccount for unknown type", () => {
    const account = AccountFactory.createFromTeller(
      mockTellerAccount("other"),
      mockTellerBalance(),
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account).toBeInstanceOf(GenericAccount);
  });

  it("creates Money VOs from Teller balance fields", () => {
    const account = AccountFactory.createFromTeller(
      mockTellerAccount("depository"),
      mockTellerBalance({ ledger: "2500.75", available: "2400.50" }),
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account.currentBalance).toBeInstanceOf(Money);
    expect(account.currentBalance!.toNumber()).toBe(2500.75);
    expect(account.availableBalance).toBeInstanceOf(Money);
    expect(account.availableBalance!.toNumber()).toBe(2400.5);
  });

  it("handles null balances", () => {
    const account = AccountFactory.createFromTeller(
      mockTellerAccount("depository"),
      mockTellerBalance({ ledger: null, available: null }),
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account.currentBalance).toBeNull();
    expect(account.availableBalance).toBeNull();
    expect(account.limitAmount).toBeNull();
  });

  it("handles null balance object", () => {
    const account = AccountFactory.createFromTeller(
      mockTellerAccount("depository"),
      null,
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account.currentBalance).toBeNull();
    expect(account.availableBalance).toBeNull();
  });

  it("extracts currency from Teller account data", () => {
    const tellerAccount = mockTellerAccount("depository");
    tellerAccount.currency = "CAD";

    const account = AccountFactory.createFromTeller(
      tellerAccount,
      mockTellerBalance(),
      USER_ID,
      ENROLLMENT_ID
    );

    expect(account.currency).toBe("CAD");
  });
});
