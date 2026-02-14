import { Decimal } from "@prisma/client/runtime/library";
import { BaseMapper } from "./base.mapper";
import { Transaction } from "@/domain/entities";
import { CategorySource } from "@/domain/enums";
import { Money, ConfidenceScore } from "@/domain/value-objects";
import { TransactionResponseDto } from "@/dtos/transaction";

class TransactionMapperImpl extends BaseMapper<Transaction, TransactionResponseDto> {
  toDto(entity: Transaction): TransactionResponseDto {
    return {
      id: entity.id,
      accountId: entity.accountId,
      accountName: entity.accountName ?? null,
      amount: entity.amount.toNumber(),
      currency: entity.amount.currency,
      date: entity.date.toISOString().split("T")[0],
      name: entity.name,
      merchantName: entity.merchantName,
      displayName: entity.getDisplayName(),
      category: entity.category,
      subcategory: entity.subcategory,
      categoryConfidence: entity.categoryConfidence?.value ?? null,
      categorySource: entity.categorySource,
      isTransfer: entity.isTransfer,
      linkedTransferId: entity.linkedTransferId,
      isPending: entity.isPending,
      isRecurring: entity.isRecurring,
      isExcluded: entity.isExcluded,
      note: entity.note,
      tellerType: entity.tellerType,
      tellerStatus: entity.tellerStatus,
      processingStatus: entity.processingStatus,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toDomain(raw: Record<string, unknown>): Transaction {
    const currency = (raw.currency as string) ?? "USD";
    const amountValue = raw.amount instanceof Decimal ? raw.amount.toString() : String(raw.amount);
    const confValue = raw.categoryConfidence != null
      ? (raw.categoryConfidence instanceof Decimal
          ? raw.categoryConfidence.toNumber()
          : Number(raw.categoryConfidence))
      : null;

    const txn = new Transaction({
      id: raw.id as string,
      userId: raw.userId as string,
      accountId: raw.accountId as string,
      tellerTransactionId: raw.tellerTransactionId as string,
      amount: new Money(amountValue, currency),
      date: new Date(raw.date as string),
      name: raw.name as string,
      merchantName: (raw.merchantName as string) ?? null,
      cleanMerchantName: (raw.cleanMerchantName as string) ?? null,
      category: (raw.category as string) ?? null,
      subcategory: (raw.subcategory as string) ?? null,
      categoryConfidence: confValue != null ? new ConfidenceScore(confValue) : null,
      categorySource: (raw.categorySource as CategorySource) ?? null,
      isTransfer: (raw.isTransfer as boolean) ?? false,
      linkedTransferId: (raw.linkedTransferId as string) ?? null,
      isPending: (raw.isPending as boolean) ?? false,
      isRecurring: (raw.isRecurring as boolean) ?? false,
      isExcluded: (raw.isExcluded as boolean) ?? false,
      note: (raw.note as string) ?? null,
      tellerType: (raw.tellerType as string) ?? null,
      tellerStatus: (raw.tellerStatus as string) ?? null,
      processingStatus: (raw.processingStatus as string) ?? null,
    });

    Object.assign(txn, {
      createdAt: raw.createdAt ? new Date(raw.createdAt as string) : txn.createdAt,
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt as string) : txn.updatedAt,
    });

    // Populate accountName from joined account data if present
    const account = raw.account as { name: string } | undefined;
    if (account?.name) {
      txn.accountName = account.name;
    }

    return txn;
  }

  toPersistence(entity: Transaction): Record<string, unknown> {
    return {
      id: entity.id,
      userId: entity.userId,
      accountId: entity.accountId,
      tellerTransactionId: entity.tellerTransactionId,
      amount: new Decimal(entity.amount.toNumber()),
      currency: entity.amount.currency,
      date: entity.date,
      name: entity.name,
      merchantName: entity.merchantName,
      cleanMerchantName: entity.cleanMerchantName,
      category: entity.category,
      subcategory: entity.subcategory,
      categoryConfidence: entity.categoryConfidence
        ? new Decimal(entity.categoryConfidence.value)
        : null,
      categorySource: entity.categorySource,
      isTransfer: entity.isTransfer,
      linkedTransferId: entity.linkedTransferId,
      isPending: entity.isPending,
      isRecurring: entity.isRecurring,
      isExcluded: entity.isExcluded,
      note: entity.note,
      tellerType: entity.tellerType,
      tellerStatus: entity.tellerStatus,
      processingStatus: entity.processingStatus,
    };
  }
}

export const TransactionMapper = new TransactionMapperImpl();
