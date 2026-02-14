import { TellerService } from "../teller.service";
import { TellerError } from "@/domain/errors";

jest.mock("@/lib/teller", () => ({
  tellerFetch: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const { tellerFetch } = require("@/lib/teller") as { tellerFetch: jest.Mock };

describe("TellerService", () => {
  let service: TellerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TellerService();
  });

  describe("getAccounts", () => {
    it("returns accounts from Teller", async () => {
      const tellerAccounts = [
        { id: "acc-1", name: "Checking", type: "depository" },
        { id: "acc-2", name: "Savings", type: "depository" },
      ];
      tellerFetch.mockResolvedValue(tellerAccounts);

      const result = await service.getAccounts("access-token");

      expect(result).toEqual(tellerAccounts);
      expect(tellerFetch).toHaveBeenCalledWith("/accounts", "access-token");
    });

    it("wraps Teller API errors in TellerError", async () => {
      tellerFetch.mockRejectedValue({
        message: "Invalid credentials",
        code: "UNAUTHORIZED",
      });

      await expect(service.getAccounts("bad-token")).rejects.toThrow(TellerError);
      await expect(service.getAccounts("bad-token")).rejects.toThrow("Invalid credentials");
    });
  });

  describe("getAccountBalances", () => {
    it("returns balances for an account", async () => {
      const balance = { account_id: "acc-1", ledger: "1000.00", available: "900.00" };
      tellerFetch.mockResolvedValue(balance);

      const result = await service.getAccountBalances("access-token", "acc-1");

      expect(result).toEqual(balance);
      expect(tellerFetch).toHaveBeenCalledWith("/accounts/acc-1/balances", "access-token");
    });
  });

  describe("getTransactions", () => {
    it("returns transactions with date range", async () => {
      const transactions = [
        { id: "txn-1", description: "Coffee", amount: "-5.50" },
      ];
      tellerFetch.mockResolvedValue(transactions);

      const result = await service.getTransactions("access-token", "acc-1", "2025-01-01", "2025-01-31");

      expect(result).toEqual(transactions);
      expect(tellerFetch).toHaveBeenCalledWith(
        "/accounts/acc-1/transactions?from_date=2025-01-01&to_date=2025-01-31",
        "access-token"
      );
    });

    it("returns transactions without date range", async () => {
      tellerFetch.mockResolvedValue([]);

      await service.getTransactions("access-token", "acc-1");

      expect(tellerFetch).toHaveBeenCalledWith(
        "/accounts/acc-1/transactions",
        "access-token"
      );
    });
  });
});
