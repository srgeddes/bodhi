import { BaseService } from "./base.service";
import { Transaction } from "@/domain/entities";
import { CategorySource } from "@/domain/enums";
import { ForbiddenError } from "@/domain/errors";
import { ConfidenceScore } from "@/domain/value-objects";
import { ITransactionRepository, TransactionFilters, TransactionAggregates, SubscriptionMerchant } from "@/domain/interfaces/repositories";
import { ICategorizationStrategy } from "@/domain/interfaces/services";
import { UpdateTransactionDto } from "@/dtos/transaction";
import { prisma } from "@/lib/db";

export class TransactionService extends BaseService<Transaction> {
  protected readonly entityName = "Transaction";
  private categorizationStrategy: ICategorizationStrategy | null = null;

  constructor(private readonly transactionRepository: ITransactionRepository) {
    super(transactionRepository);
  }

  setCategorizationStrategy(strategy: ICategorizationStrategy): void {
    this.categorizationStrategy = strategy;
  }

  async findByUserId(
    userId: string,
    filters?: TransactionFilters
  ): Promise<{ transactions: Transaction[]; total: number; aggregates: TransactionAggregates }> {
    const [transactions, total, aggregates] = await Promise.all([
      this.transactionRepository.findByUserId(userId, filters),
      this.transactionRepository.countByUserId(userId, filters),
      this.transactionRepository.aggregateByUserId(userId, filters),
    ]);
    return { transactions, total, aggregates };
  }

  async findByIdForUser(id: string, userId: string): Promise<Transaction> {
    const txn = await this.findById(id);
    this.verifyOwnership(txn, userId);
    return txn;
  }

  async updateTransaction(
    id: string,
    userId: string,
    dto: UpdateTransactionDto
  ): Promise<Transaction> {
    const txn = await this.findById(id);
    this.verifyOwnership(txn, userId);

    const updateData: Partial<Transaction> = {};

    if (dto.category !== undefined) {
      Object.assign(updateData, {
        category: dto.category,
        subcategory: dto.subcategory ?? null,
        categorySource: CategorySource.UserOverride,
        categoryConfidence: new ConfidenceScore(1.0),
      });
    }
    if (dto.isExcluded !== undefined) {
      Object.assign(updateData, { isExcluded: dto.isExcluded });
    }
    if (dto.note !== undefined) {
      Object.assign(updateData, { note: dto.note });
    }

    return this.transactionRepository.update(id, updateData);
  }

  async upsertByTellerTransactionId(
    data: Partial<Transaction> & { tellerTransactionId: string }
  ): Promise<Transaction> {
    return this.transactionRepository.upsertByTellerTransactionId(data);
  }

  async batchUpsertByTellerTransactionId(
    items: (Partial<Transaction> & { tellerTransactionId: string })[]
  ): Promise<{ succeeded: number; failed: number }> {
    return this.transactionRepository.batchUpsertByTellerTransactionId(items);
  }

  async deleteByTellerTransactionIds(tellerTransactionIds: string[]): Promise<number> {
    return this.transactionRepository.deleteByTellerTransactionIds(tellerTransactionIds);
  }

  async findNeedingReview(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findNeedingReview(userId);
  }

  async getSubscriptionMerchants(userId: string): Promise<SubscriptionMerchant[]> {
    const [candidates, overrides] = await Promise.all([
      this.transactionRepository.findSubscriptionMerchants(userId),
      prisma.subscriptionOverride.findMany({
        where: { userId },
        select: { merchantName: true },
      }),
    ]);

    const excludedMerchants = new Set(overrides.map((o) => o.merchantName));
    return candidates.filter((c) => !excludedMerchants.has(c.merchantName));
  }

  async addSubscriptionOverride(userId: string, merchantName: string): Promise<void> {
    await prisma.subscriptionOverride.upsert({
      where: { userId_merchantName: { userId, merchantName } },
      create: { userId, merchantName },
      update: {},
    });
  }

  async removeSubscriptionOverride(userId: string, merchantName: string): Promise<void> {
    await prisma.subscriptionOverride.deleteMany({
      where: { userId, merchantName },
    });
  }

  async getSubscriptionOverrides(userId: string): Promise<string[]> {
    const overrides = await prisma.subscriptionOverride.findMany({
      where: { userId },
      select: { merchantName: true },
    });
    return overrides.map((o) => o.merchantName);
  }

  private verifyOwnership(txn: Transaction, userId: string): void {
    if (txn.userId !== userId) {
      throw new ForbiddenError("You do not have access to this transaction");
    }
  }
}
