import { Transaction } from "@/domain/entities";
import { ConfidenceScore } from "@/domain/value-objects";

export interface CategorizationResult {
  category: string;
  subcategory: string | null;
  confidence: ConfidenceScore;
}

export interface ICategorizationStrategy {
  categorize(transaction: Transaction): Promise<CategorizationResult | null>;
}
