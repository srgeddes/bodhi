import { BaseEntity } from "./base.entity";
import { AccountType } from "@/domain/enums";
import { Money } from "@/domain/value-objects";

export abstract class Account extends BaseEntity {
  userId: string;
  tellerEnrollmentId: string;
  tellerAccountId: string;
  name: string;
  officialName: string | null;
  type: AccountType;
  subtype: string | null;
  mask: string | null;
  currentBalance: Money | null;
  availableBalance: Money | null;
  limitAmount: Money | null;
  currency: string;
  institutionId: string | null;
  isHidden: boolean;
  lastSyncedAt: Date | null;

  constructor(params: {
    id?: string;
    userId: string;
    tellerEnrollmentId: string;
    tellerAccountId: string;
    name: string;
    officialName?: string | null;
    type: AccountType;
    subtype?: string | null;
    mask?: string | null;
    currentBalance?: Money | null;
    availableBalance?: Money | null;
    limitAmount?: Money | null;
    currency?: string;
    institutionId?: string | null;
    isHidden?: boolean;
    lastSyncedAt?: Date | null;
  }) {
    super(params.id);
    this.userId = params.userId;
    this.tellerEnrollmentId = params.tellerEnrollmentId;
    this.tellerAccountId = params.tellerAccountId;
    this.name = params.name;
    this.officialName = params.officialName ?? null;
    this.type = params.type;
    this.subtype = params.subtype ?? null;
    this.mask = params.mask ?? null;
    this.currentBalance = params.currentBalance ?? null;
    this.availableBalance = params.availableBalance ?? null;
    this.limitAmount = params.limitAmount ?? null;
    this.currency = params.currency ?? "USD";
    this.institutionId = params.institutionId ?? null;
    this.isHidden = params.isHidden ?? false;
    this.lastSyncedAt = params.lastSyncedAt ?? null;
  }

  abstract getDisplayBalance(): Money | null;
}

export class BankAccount extends Account {
  constructor(params: ConstructorParameters<typeof Account>[0]) {
    super({ ...params, type: AccountType.Depository });
  }

  getDisplayBalance(): Money | null {
    return this.availableBalance ?? this.currentBalance;
  }
}

export class CreditCardAccount extends Account {
  constructor(params: ConstructorParameters<typeof Account>[0]) {
    super({ ...params, type: AccountType.Credit });
  }

  getDisplayBalance(): Money | null {
    return this.currentBalance;
  }

  getAvailableCredit(): Money | null {
    if (!this.limitAmount || !this.currentBalance) return null;
    return this.limitAmount.subtract(this.currentBalance);
  }
}

export class InvestmentAccount extends Account {
  constructor(params: ConstructorParameters<typeof Account>[0]) {
    super({ ...params, type: AccountType.Investment });
  }

  getDisplayBalance(): Money | null {
    return this.currentBalance;
  }
}

export class LoanAccount extends Account {
  constructor(params: ConstructorParameters<typeof Account>[0]) {
    super({ ...params, type: AccountType.Loan });
  }

  getDisplayBalance(): Money | null {
    return this.currentBalance;
  }
}

export class GenericAccount extends Account {
  getDisplayBalance(): Money | null {
    return this.currentBalance;
  }
}
