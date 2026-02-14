import { BaseService } from "./base.service";
import { TellerEnrollment, Transaction } from "@/domain/entities";
import { EnrollmentStatus, CategorySource, AccountType } from "@/domain/enums";
import { Money } from "@/domain/value-objects";
import { ITellerEnrollmentRepository } from "@/domain/interfaces/repositories";
import { TellerService } from "./teller.service";
import { AccountService } from "./account.service";
import { TransactionService } from "./transaction.service";
import { AccountFactory } from "@/factories/account.factory";
import { encrypt, decrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";
import { TellerConnectSuccessDto } from "@/dtos/teller";
import {
  TRANSACTION_SYNC_LOOKBACK_DAYS,
  TRANSACTION_SYNC_OVERLAP_DAYS,
} from "@/config/constants";

export class TellerEnrollmentService extends BaseService<TellerEnrollment> {
  protected readonly entityName = "TellerEnrollment";

  constructor(
    private readonly tellerEnrollmentRepository: ITellerEnrollmentRepository,
    private readonly tellerService: TellerService,
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService
  ) {
    super(tellerEnrollmentRepository);
  }

  async connectAccount(
    userId: string,
    dto: TellerConnectSuccessDto
  ): Promise<{ enrollment: TellerEnrollment; accounts: Awaited<ReturnType<AccountService["findByUserId"]>> }> {
    // 1. Encrypt access token (Teller gives it directly, no exchange step)
    const encryptedToken = encrypt(dto.accessToken);
    const enrollment = new TellerEnrollment({
      userId,
      accessToken: encryptedToken,
      enrollmentId: dto.enrollmentId,
      institutionName: dto.institutionName ?? null,
    });

    const createdEnrollment = await this.repository.create(enrollment);

    // 2. Fetch accounts + balances from Teller
    const tellerAccounts = await this.tellerService.getAccounts(dto.accessToken);
    for (const tellerAccount of tellerAccounts) {
      let balance = null;
      try {
        balance = await this.tellerService.getAccountBalances(dto.accessToken, tellerAccount.id);
      } catch (err) {
        logger.warn("Failed to fetch balance for account", {
          tellerAccountId: tellerAccount.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      const account = AccountFactory.createFromTeller(
        tellerAccount,
        balance,
        userId,
        createdEnrollment.id
      );
      await this.accountService.upsertByTellerAccountId({
        ...account,
        tellerAccountId: tellerAccount.id,
      });
    }

    // 3. Fire-and-forget initial transaction sync
    this.syncTransactions(createdEnrollment.id).catch((err) => {
      logger.warn("Initial transaction sync failed — will retry on cron", {
        enrollmentId: createdEnrollment.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    // 4. Return results
    const accounts = await this.accountService.findByUserId(userId);
    return { enrollment: createdEnrollment, accounts };
  }

  async syncTransactions(enrollmentId: string): Promise<void> {
    const enrollment = await this.findById(enrollmentId);

    // Decrypt access token
    const accessToken = decrypt(enrollment.accessToken);

    // Fetch accounts for this enrollment (direct DB filter, no in-memory filtering)
    const enrollmentAccounts = await this.accountService.findByEnrollmentId(enrollmentId);

    // Determine date range
    const today = new Date();
    let fromDate: Date;

    if (enrollment.lastSyncedDate) {
      // Incremental: go back OVERLAP_DAYS from last sync to catch stragglers
      fromDate = new Date(enrollment.lastSyncedDate);
      fromDate.setDate(fromDate.getDate() - TRANSACTION_SYNC_OVERLAP_DAYS);
    } else {
      // Initial: look back LOOKBACK_DAYS
      fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - TRANSACTION_SYNC_LOOKBACK_DAYS);
    }

    const fromDateStr = fromDate.toISOString().split("T")[0];
    const toDateStr = today.toISOString().split("T")[0];

    for (const account of enrollmentAccounts) {
      try {
        // Fetch transactions
        const tellerTransactions = await this.tellerService.getTransactions(
          accessToken,
          account.tellerAccountId,
          fromDateStr,
          toDateStr
        );

        logger.info("Transaction sync for account", {
          enrollmentId,
          tellerAccountId: account.tellerAccountId,
          count: tellerTransactions.length,
        });

        // Batch upsert all transactions for this account
        const mappedTransactions = tellerTransactions.map((tellerTxn) =>
          this.mapTellerTransaction(tellerTxn, enrollment.userId, account.id, account.type)
        );
        const { succeeded, failed } = await this.transactionService.batchUpsertByTellerTransactionId(mappedTransactions);
        if (failed > 0) {
          logger.warn("Some transactions failed to upsert", {
            enrollmentId,
            tellerAccountId: account.tellerAccountId,
            succeeded,
            failed,
          });
        }

        // Refresh balances
        try {
          const balance = await this.tellerService.getAccountBalances(
            accessToken,
            account.tellerAccountId
          );
          await this.accountService.upsertByTellerAccountId({
            tellerAccountId: account.tellerAccountId,
            currentBalance: balance.ledger != null ? new Money(balance.ledger, account.currency) : null,
            availableBalance: balance.available != null ? new Money(balance.available, account.currency) : null,
            lastSyncedAt: new Date(),
          });
        } catch (err) {
          logger.warn("Failed to refresh balance", {
            tellerAccountId: account.tellerAccountId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } catch (err) {
        logger.error("Failed to sync transactions for account", {
          tellerAccountId: account.tellerAccountId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Update last synced date
    await this.tellerEnrollmentRepository.updateLastSyncedDate(enrollmentId, today);
  }

  async handleWebhook(eventType: string, enrollmentId: string): Promise<void> {
    const enrollment = await this.tellerEnrollmentRepository.findByEnrollmentId(enrollmentId);
    if (!enrollment) {
      logger.warn("Webhook for unknown enrollment", { enrollmentId, eventType });
      return;
    }

    switch (eventType) {
      case "enrollment.disconnected":
        await this.tellerEnrollmentRepository.update(enrollment.id, {
          status: EnrollmentStatus.Disconnected,
        } as Partial<TellerEnrollment>);
        break;
      case "transactions.processed":
        await this.syncTransactions(enrollment.id);
        break;
      default:
        logger.info("Unhandled Teller webhook event", { eventType });
    }
  }

  private mapTellerTransaction(
    tellerTxn: {
      id: string;
      account_id: string;
      date: string;
      description: string;
      details: { category: string; counterparty: { name: string | null } | null; processing_status: string };
      amount: string;
      status: string;
      type: string;
    },
    userId: string,
    accountId: string,
    accountType: AccountType
  ): Partial<Transaction> & { tellerTransactionId: string } {
    const category = tellerTxn.details?.category ?? null;
    const counterpartyName = tellerTxn.details?.counterparty?.name ?? null;

    // Negate: Teller positive = money out, but app convention is negative = expense
    const amount = new Money(tellerTxn.amount, "USD").negate();

    // For credit cards and loans, positive amounts (after negation) are bill payments,
    // not income. Mark them as transfers so they're excluded from income totals.
    const isCreditOrLoan = accountType === AccountType.Credit || accountType === AccountType.Loan;
    const isPaymentToAccount = isCreditOrLoan && amount.toNumber() > 0;

    return {
      userId,
      accountId,
      tellerTransactionId: tellerTxn.id,
      amount,
      date: new Date(tellerTxn.date),
      name: tellerTxn.description,
      merchantName: counterpartyName,
      cleanMerchantName: counterpartyName,
      category,
      subcategory: null,
      categoryConfidence: null,
      categorySource: category ? CategorySource.Teller : null,
      isTransfer: isPaymentToAccount,
      isPending: tellerTxn.status === "pending",
      tellerType: tellerTxn.type ?? null,
      tellerStatus: tellerTxn.status ?? null,
      processingStatus: tellerTxn.details?.processing_status ?? null,
    } as Partial<Transaction> & { tellerTransactionId: string };
  }
}
