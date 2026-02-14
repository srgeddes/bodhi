import { BaseEntity } from "./base.entity";
import { CategorySource } from "@/domain/enums";
import { Money } from "@/domain/value-objects";
import { ConfidenceScore } from "@/domain/value-objects";

export class Transaction extends BaseEntity {
  userId: string;
  accountId: string;
  tellerTransactionId: string;
  amount: Money;
  date: Date;
  name: string;
  merchantName: string | null;
  cleanMerchantName: string | null;
  category: string | null;
  subcategory: string | null;
  categoryConfidence: ConfidenceScore | null;
  categorySource: CategorySource | null;
  isTransfer: boolean;
  linkedTransferId: string | null;
  isPending: boolean;
  isRecurring: boolean;
  isExcluded: boolean;
  note: string | null;
  tellerType: string | null;
  tellerStatus: string | null;
  processingStatus: string | null;
  /** Populated via JOIN when includeAccountName filter is set — not persisted */
  accountName: string | null;

  constructor(params: {
    id?: string;
    userId: string;
    accountId: string;
    tellerTransactionId: string;
    amount: Money;
    date: Date;
    name: string;
    merchantName?: string | null;
    cleanMerchantName?: string | null;
    category?: string | null;
    subcategory?: string | null;
    categoryConfidence?: ConfidenceScore | null;
    categorySource?: CategorySource | null;
    isTransfer?: boolean;
    linkedTransferId?: string | null;
    isPending?: boolean;
    isRecurring?: boolean;
    isExcluded?: boolean;
    note?: string | null;
    tellerType?: string | null;
    tellerStatus?: string | null;
    processingStatus?: string | null;
  }) {
    super(params.id);
    this.userId = params.userId;
    this.accountId = params.accountId;
    this.tellerTransactionId = params.tellerTransactionId;
    this.amount = params.amount;
    this.date = params.date;
    this.name = params.name;
    this.merchantName = params.merchantName ?? null;
    this.cleanMerchantName = params.cleanMerchantName ?? null;
    this.category = params.category ?? null;
    this.subcategory = params.subcategory ?? null;
    this.categoryConfidence = params.categoryConfidence ?? null;
    this.categorySource = params.categorySource ?? null;
    this.isTransfer = params.isTransfer ?? false;
    this.linkedTransferId = params.linkedTransferId ?? null;
    this.isPending = params.isPending ?? false;
    this.isRecurring = params.isRecurring ?? false;
    this.isExcluded = params.isExcluded ?? false;
    this.note = params.note ?? null;
    this.tellerType = params.tellerType ?? null;
    this.tellerStatus = params.tellerStatus ?? null;
    this.processingStatus = params.processingStatus ?? null;
    this.accountName = null;
  }

  categorize(category: string, subcategory: string | null, confidence: ConfidenceScore, source: CategorySource): void {
    this.category = category;
    this.subcategory = subcategory;
    this.categoryConfidence = confidence;
    this.categorySource = source;
    this.updatedAt = new Date();
  }

  markAsTransfer(linkedTransferId: string | null): void {
    this.isTransfer = true;
    this.linkedTransferId = linkedTransferId;
    this.updatedAt = new Date();
  }

  needsReview(): boolean {
    if (!this.category) return true;
    if (this.categoryConfidence && this.categoryConfidence.isLow()) return true;
    return false;
  }

  getDisplayName(): string {
    return this.cleanMerchantName ?? this.merchantName ?? this.name;
  }
}
