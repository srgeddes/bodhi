import { Decimal } from "@prisma/client/runtime/library";
import { BaseMapper } from "./base.mapper";
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
import { AccountResponseDto } from "@/dtos/account";

class AccountMapperImpl extends BaseMapper<Account, AccountResponseDto> {
  toDto(entity: Account): AccountResponseDto {
    const displayBalance = entity.getDisplayBalance();
    return {
      id: entity.id,
      tellerEnrollmentId: entity.tellerEnrollmentId,
      name: entity.name,
      officialName: entity.officialName,
      type: entity.type,
      subtype: entity.subtype,
      mask: entity.mask,
      currentBalance: entity.currentBalance?.toNumber() ?? null,
      availableBalance: entity.availableBalance?.toNumber() ?? null,
      limitAmount: entity.limitAmount?.toNumber() ?? null,
      currency: entity.currency,
      displayBalance: displayBalance?.toNumber() ?? null,
      isHidden: entity.isHidden,
      institutionId: entity.institutionId,
      institutionName: null, // populated by service when needed
      lastSyncedAt: entity.lastSyncedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toDomain(raw: Record<string, unknown>): Account {
    const type = (raw.type as string) in AccountType
      ? (raw.type as AccountType)
      : accountTypeFromTeller(raw.type as string);

    const currency = (raw.currency as string) ?? "USD";
    const params = {
      id: raw.id as string,
      userId: raw.userId as string,
      tellerEnrollmentId: raw.tellerEnrollmentId as string,
      tellerAccountId: raw.tellerAccountId as string,
      name: raw.name as string,
      officialName: (raw.officialName as string) ?? null,
      type,
      subtype: (raw.subtype as string) ?? null,
      mask: (raw.mask as string) ?? null,
      currentBalance: raw.currentBalance != null
        ? new Money(raw.currentBalance instanceof Decimal ? raw.currentBalance.toString() : String(raw.currentBalance), currency)
        : null,
      availableBalance: raw.availableBalance != null
        ? new Money(raw.availableBalance instanceof Decimal ? raw.availableBalance.toString() : String(raw.availableBalance), currency)
        : null,
      limitAmount: raw.limitAmount != null
        ? new Money(raw.limitAmount instanceof Decimal ? raw.limitAmount.toString() : String(raw.limitAmount), currency)
        : null,
      currency,
      institutionId: (raw.institutionId as string) ?? null,
      isHidden: (raw.isHidden as boolean) ?? false,
      lastSyncedAt: raw.lastSyncedAt ? new Date(raw.lastSyncedAt as string) : null,
    };

    let account: Account;
    switch (type) {
      case AccountType.Depository:
        account = new BankAccount(params);
        break;
      case AccountType.Credit:
        account = new CreditCardAccount(params);
        break;
      case AccountType.Investment:
      case AccountType.Brokerage:
        account = new InvestmentAccount(params);
        break;
      case AccountType.Loan:
        account = new LoanAccount(params);
        break;
      default:
        account = new GenericAccount(params);
    }

    Object.assign(account, {
      createdAt: raw.createdAt ? new Date(raw.createdAt as string) : account.createdAt,
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt as string) : account.updatedAt,
    });

    return account;
  }

  toPersistence(entity: Account): Record<string, unknown> {
    return {
      id: entity.id,
      userId: entity.userId,
      tellerEnrollmentId: entity.tellerEnrollmentId,
      tellerAccountId: entity.tellerAccountId,
      name: entity.name,
      officialName: entity.officialName,
      type: entity.type,
      subtype: entity.subtype,
      mask: entity.mask,
      currentBalance: entity.currentBalance ? new Decimal(entity.currentBalance.toNumber()) : null,
      availableBalance: entity.availableBalance ? new Decimal(entity.availableBalance.toNumber()) : null,
      limitAmount: entity.limitAmount ? new Decimal(entity.limitAmount.toNumber()) : null,
      currency: entity.currency,
      institutionId: entity.institutionId,
      isHidden: entity.isHidden,
      lastSyncedAt: entity.lastSyncedAt,
    };
  }
}

export const AccountMapper = new AccountMapperImpl();
