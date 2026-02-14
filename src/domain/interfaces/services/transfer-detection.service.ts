import { Transaction, Account } from "@/domain/entities";

export interface TransferPair {
  fromTransaction: Transaction;
  toTransaction: Transaction;
}

export interface ITransferDetectionStrategy {
  detect(transactions: Transaction[], accounts: Account[]): Promise<TransferPair[]>;
}
