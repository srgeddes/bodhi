import {
  Account,
  BankAccount,
  CreditCardAccount,
  InvestmentAccount,
  LoanAccount,
  GenericAccount,
} from "@/domain/entities";
import { AccountType, accountTypeFromTeller } from "@/domain/enums";
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

export class AccountFactory {
  static createFromTeller(
    tellerAccount: TellerAccount,
    tellerBalance: TellerBalance | null,
    userId: string,
    tellerEnrollmentId: string
  ): Account {
    const type = accountTypeFromTeller(tellerAccount.type);
    const currency = tellerAccount.currency ?? "USD";

    const params = {
      userId,
      tellerEnrollmentId,
      tellerAccountId: tellerAccount.id,
      name: tellerAccount.name,
      officialName: null,
      type,
      subtype: tellerAccount.subtype ?? null,
      mask: tellerAccount.last_four ?? null,
      currentBalance: tellerBalance?.ledger != null
        ? new Money(tellerBalance.ledger, currency)
        : null,
      availableBalance: tellerBalance?.available != null
        ? new Money(tellerBalance.available, currency)
        : null,
      limitAmount: null,
      currency,
      institutionId: tellerAccount.institution?.id ?? null,
    };

    switch (type) {
      case AccountType.Depository:
        return new BankAccount(params);
      case AccountType.Credit:
        return new CreditCardAccount(params);
      case AccountType.Investment:
      case AccountType.Brokerage:
        return new InvestmentAccount(params);
      case AccountType.Loan:
        return new LoanAccount(params);
      default:
        return new GenericAccount(params);
    }
  }
}
