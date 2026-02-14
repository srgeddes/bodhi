import { tellerFetch } from "@/lib/teller";
import { TellerError } from "@/domain/errors";
import { logger } from "@/lib/logger";

interface TellerAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  last_four: string | null;
  currency: string;
  enrollment_id: string;
  institution: { name: string; id: string };
}

interface TellerBalance {
  account_id: string;
  ledger: string | null;
  available: string | null;
}

interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  details: { category: string; counterparty: { name: string | null } | null; processing_status: string };
  amount: string;
  status: string;
  type: string;
}

export class TellerService {
  async getAccounts(accessToken: string): Promise<TellerAccount[]> {
    try {
      return await tellerFetch<TellerAccount[]>("/accounts", accessToken);
    } catch (error) {
      throw this.handleTellerError(error);
    }
  }

  async getAccountBalances(accessToken: string, accountId: string): Promise<TellerBalance> {
    try {
      return await tellerFetch<TellerBalance>(`/accounts/${accountId}/balances`, accessToken);
    } catch (error) {
      throw this.handleTellerError(error);
    }
  }

  async getTransactions(
    accessToken: string,
    accountId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<TellerTransaction[]> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from_date", fromDate);
      if (toDate) params.set("to_date", toDate);
      const query = params.toString();
      const path = `/accounts/${accountId}/transactions${query ? `?${query}` : ""}`;
      return await tellerFetch<TellerTransaction[]>(path, accessToken);
    } catch (error) {
      throw this.handleTellerError(error);
    }
  }

  private handleTellerError(error: unknown): TellerError {
    if (error instanceof TellerError) return error;

    if (error && typeof error === "object" && "message" in error) {
      const err = error as { message?: string; code?: string };
      const message = err.message ?? "Teller API error";
      const code = err.code ?? "UNKNOWN";
      logger.error("Teller API error", { message, code });
      return new TellerError(message, code);
    }

    return new TellerError("Unknown Teller error", "UNKNOWN");
  }
}
