import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db";
import { BaseRepository } from "../base.repository";
import { Transaction } from "@/domain/entities";
import { ITransactionRepository, TransactionFilters, TransactionAggregates, SubscriptionMerchant } from "@/domain/interfaces/repositories";
import { TransactionMapper } from "@/mappers";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

export class PrismaTransactionRepository extends BaseRepository<Transaction> implements ITransactionRepository {
  protected get delegate() {
    return prisma.transaction;
  }

  protected toEntity(raw: unknown): Transaction {
    return TransactionMapper.toDomain(raw as Record<string, unknown>);
  }

  protected toCreateData(data: Partial<Transaction>): Record<string, unknown> {
    return TransactionMapper.toPersistence(data as Transaction);
  }

  protected toUpdateData(data: Partial<Transaction>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const fields = [
      "category", "subcategory", "categorySource",
      "isTransfer", "linkedTransferId", "isExcluded", "isRecurring", "note",
      "isPending", "name", "merchantName", "cleanMerchantName",
      "date",
    ] as const;
    for (const field of fields) {
      if ((data as Record<string, unknown>)[field] !== undefined) {
        result[field] = (data as Record<string, unknown>)[field];
      }
    }
    // Convert Money value object to Prisma Decimal
    if (data.amount !== undefined) {
      result.amount = new Decimal(data.amount.toNumber());
      result.currency = data.amount.currency;
    }
    // Convert ConfidenceScore value object to Prisma Decimal
    if (data.categoryConfidence !== undefined) {
      result.categoryConfidence = data.categoryConfidence
        ? new Decimal(data.categoryConfidence.value)
        : null;
    }
    return result;
  }

  async findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    const where = this.buildWhereClause(userId, filters);
    const include = filters?.includeAccountName
      ? { account: { select: { name: true } } }
      : undefined;
    const raw = await prisma.transaction.findMany({
      where,
      include,
      orderBy: { date: "desc" },
      take: filters?.limit ?? DEFAULT_PAGE_SIZE,
      skip: filters?.offset ?? 0,
    });
    return raw.map((r) => this.toEntity(r));
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const raw = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });
    return raw.map((r) => this.toEntity(r));
  }

  async upsertByTellerTransactionId(
    data: Partial<Transaction> & { tellerTransactionId: string }
  ): Promise<Transaction> {
    const createData = this.toCreateData(data as Transaction);
    const updateData = this.toUpdateData(data);

    const raw = await prisma.transaction.upsert({
      where: { tellerTransactionId: data.tellerTransactionId },
      create: createData as Parameters<typeof prisma.transaction.create>[0]["data"],
      update: updateData as Parameters<typeof prisma.transaction.update>[0]["data"],
    });
    return this.toEntity(raw);
  }

  async batchUpsertByTellerTransactionId(
    items: (Partial<Transaction> & { tellerTransactionId: string })[]
  ): Promise<{ succeeded: number; failed: number }> {
    if (items.length === 0) return { succeeded: 0, failed: 0 };

    const CHUNK_SIZE = 50;
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(async (tx) => {
        for (const data of chunk) {
          try {
            const createData = this.toCreateData(data as Transaction);
            const updateData = this.toUpdateData(data);
            await tx.transaction.upsert({
              where: { tellerTransactionId: data.tellerTransactionId },
              create: createData as Parameters<typeof prisma.transaction.create>[0]["data"],
              update: updateData as Parameters<typeof prisma.transaction.update>[0]["data"],
            });
            succeeded++;
          } catch {
            failed++;
          }
        }
      });
    }

    return { succeeded, failed };
  }

  async deleteByTellerTransactionIds(tellerTransactionIds: string[]): Promise<number> {
    if (tellerTransactionIds.length === 0) return 0;
    const result = await prisma.transaction.deleteMany({
      where: { tellerTransactionId: { in: tellerTransactionIds } },
    });
    return result.count;
  }

  async findNeedingReview(userId: string): Promise<Transaction[]> {
    const raw = await prisma.transaction.findMany({
      where: {
        userId,
        OR: [
          { category: null },
          { categoryConfidence: { lt: 0.5 } },
        ],
      },
      orderBy: { date: "desc" },
    });
    return raw.map((r) => this.toEntity(r));
  }

  async countByUserId(userId: string, filters?: TransactionFilters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return prisma.transaction.count({ where });
  }

  async aggregateByUserId(userId: string, filters?: TransactionFilters): Promise<TransactionAggregates> {
    const where = this.buildWhereClause(userId, filters);

    // Exclude transfers from income/expense totals
    const baseWhere = { ...where, isTransfer: false };
    const existingAmountFilter = (where.amount ?? {}) as Record<string, unknown>;

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseWhere, amount: { ...existingAmountFilter, gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, amount: { ...existingAmountFilter, lt: 0 } },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalIncome: incomeResult._sum.amount?.toNumber() ?? 0,
      totalExpenses: Math.abs(expenseResult._sum.amount?.toNumber() ?? 0),
    };
  }

  private buildWhereClause(
    userId: string,
    filters?: TransactionFilters
  ): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = { userId };

    if (!filters) return where;

    if (filters.accountIds?.length) {
      where.accountId = { in: filters.accountIds };
    }
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }
    if (filters.categories?.length) {
      where.category = { in: filters.categories };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { merchantName: { contains: filters.search, mode: "insensitive" } },
        { cleanMerchantName: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }
    if (filters.isTransfer !== undefined) where.isTransfer = filters.isTransfer;
    if (filters.isPending !== undefined) where.isPending = filters.isPending;
    if (filters.isExcluded !== undefined) where.isExcluded = filters.isExcluded;
    if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring;
    if (filters.merchantNames?.length) {
      where.merchantName = { in: filters.merchantNames };
    }

    return where;
  }

  async findSubscriptionMerchants(userId: string): Promise<SubscriptionMerchant[]> {
    // Find merchants with 2+ expense charges
    const results = await prisma.transaction.groupBy({
      by: ["merchantName"],
      where: {
        userId,
        merchantName: { not: null },
        isTransfer: false,
        amount: { lt: 0 },
      },
      _count: { id: true },
      _avg: { amount: true },
      _max: { date: true },
      having: {
        id: { _count: { gte: 2 } },
      },
    });

    const candidates: SubscriptionMerchant[] = [];

    for (const row of results) {
      if (!row.merchantName) continue;

      const txns = await prisma.transaction.findMany({
        where: {
          userId,
          merchantName: row.merchantName,
          isTransfer: false,
          amount: { lt: 0 },
        },
        select: { amount: true, date: true },
        orderBy: { date: "desc" },
      });

      if (txns.length < 2) continue;

      const amounts = txns.map((t) => Math.abs(t.amount.toNumber()));
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      // Amounts should be within 40% of the average
      const isConsistent = amounts.every(
        (a) => Math.abs(a - avg) / avg <= 0.4
      );
      if (!isConsistent) continue;

      // Charges must span at least 2 different calendar months
      const months = new Set(
        txns.map((t) => `${t.date.getFullYear()}-${t.date.getMonth()}`)
      );
      if (months.size < 2) continue;

      candidates.push({
        merchantName: row.merchantName,
        chargeCount: row._count.id,
        averageAmount: Math.abs(row._avg.amount?.toNumber() ?? 0),
        lastChargeDate: row._max.date!,
      });
    }

    return candidates;
  }
}
