import { Transaction } from "@/domain/entities";
import { IBaseRepository } from "./base.repository";

export interface TransactionFilters {
  userId?: string;
  accountIds?: string[];
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  isTransfer?: boolean;
  isPending?: boolean;
  isExcluded?: boolean;
  isRecurring?: boolean;
  merchantNames?: string[];
  limit?: number;
  offset?: number;
  includeAccountName?: boolean;
}

export interface TransactionAggregates {
  totalIncome: number;
  totalExpenses: number;
}

export interface ITransactionRepository extends IBaseRepository<Transaction> {
  findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  upsertByTellerTransactionId(data: Partial<Transaction> & { tellerTransactionId: string }): Promise<Transaction>;
  batchUpsertByTellerTransactionId(
    items: (Partial<Transaction> & { tellerTransactionId: string })[]
  ): Promise<{ succeeded: number; failed: number }>;
  deleteByTellerTransactionIds(tellerTransactionIds: string[]): Promise<number>;
  findNeedingReview(userId: string): Promise<Transaction[]>;
  countByUserId(userId: string, filters?: TransactionFilters): Promise<number>;
  aggregateByUserId(userId: string, filters?: TransactionFilters): Promise<TransactionAggregates>;
  findSubscriptionMerchants(userId: string): Promise<SubscriptionMerchant[]>;
}

export interface SubscriptionMerchant {
  merchantName: string;
  chargeCount: number;
  averageAmount: number;
  lastChargeDate: Date;
}
