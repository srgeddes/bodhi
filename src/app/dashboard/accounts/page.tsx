"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import {
  useTellerConnect,
  type TellerConnectEnrollment,
  type TellerConnectFailure,
} from "teller-connect-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { AccountList } from "@/features/accounts/components/AccountList";
import { InstitutionPicker } from "@/features/accounts/components/InstitutionPicker";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/utils/format.utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AccountsPage() {
  const { accounts, isLoading, refetch } = useAccounts();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleTellerSuccess = useCallback(
    async (authorization: TellerConnectEnrollment) => {
      try {
        await apiClient.post("/api/teller/connect", {
          accessToken: authorization.accessToken,
          enrollmentId: authorization.enrollment.id,
          institutionName: authorization.enrollment.institution.name,
        });
        toast.success("Account connected");
        setPickerOpen(false);
        refetch();
      } catch (error) {
        console.error("Teller connect error:", error);
        toast.error(
          error instanceof ApiClientError
            ? error.message
            : "Failed to connect account. Please try again."
        );
      }
    },
    [refetch]
  );

  const { open, ready } = useTellerConnect({
    applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID ?? "",
    environment:
      (process.env.NEXT_PUBLIC_TELLER_ENVIRONMENT as
        | "sandbox"
        | "development"
        | "production") ?? "sandbox",
    onSuccess: handleTellerSuccess,
    onFailure: (failure: TellerConnectFailure) => {
      console.error("Teller Connect failure:", failure);
      toast.error(`Connection failed: ${failure.message}`);
    },
    onExit: () => {},
  });

  const { assets, liabilities, netWorth } = useMemo(() => {
    let a = 0;
    let l = 0;
    for (const acc of accounts) {
      const bal = acc.displayBalance ?? acc.currentBalance ?? 0;
      const type = acc.type.toLowerCase();
      if (type === "credit" || type === "loan") {
        l += Math.abs(bal);
      } else {
        a += bal;
      }
    }
    return { assets: a, liabilities: l, netWorth: a - l };
  }, [accounts]);

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[130px] w-full rounded-xl" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (accounts.length === 0) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your financial accounts to get started
          </p>
        </div>
        <InstitutionPicker onOpen={open} ready={ready} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header: net worth + actions */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Net Worth
          </p>
          <p
            className={cn(
              "mt-0.5 text-3xl font-bold tabular-nums tracking-tight",
              netWorth >= 0 ? "text-foreground" : "text-[var(--error-text)]"
            )}
          >
            {netWorth < 0 && "\u2212"}
            {formatCurrency(Math.abs(netWorth))}
          </p>
          <div className="mt-1.5 flex gap-4 text-xs text-muted-foreground">
            <span>
              Assets{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatCurrency(assets)}
              </span>
            </span>
            <span>
              Liabilities{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatCurrency(liabilities)}
              </span>
            </span>
          </div>
        </div>
        <Button size="sm" onClick={() => setPickerOpen(true)} className="gap-1.5">
          <Plus className="size-3.5" />
          Add Account
        </Button>
      </div>

      {/* Accounts grouped by institution */}
      <AccountList accounts={accounts} />

      {/* Add account sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="right" className="w-full max-w-lg p-0">
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle>Add Account</SheetTitle>
          </SheetHeader>
          <div className="overflow-auto p-6" style={{ maxHeight: "calc(100vh - 5rem)" }}>
            <InstitutionPicker onOpen={open} ready={ready} />
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
