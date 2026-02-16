"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Clock,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  EyeOff,
  Link2,
  Zap,
  ZapOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MerchantLogo } from "@/components/MerchantLogo";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency, formatDate } from "@/utils/format.utils";
import { classifyTransaction } from "@/utils/transaction.utils";
import { cn } from "@/lib/utils";
import type { TransactionResponseDto } from "@/dtos/transaction";

const categorySourceLabels: Record<string, string> = {
  TELLER: "Auto-detected",
  AI: "AI",
  RULE: "Rule",
  USER_OVERRIDE: "Manual",
};

interface TransactionDetailModalProps {
  transaction: TransactionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionMerchantNames?: string[];
  onMarkNotSubscription?: (merchantName: string) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function FlagBadge({
  icon: Icon,
  label,
  variant,
}: {
  icon: typeof Clock;
  label: string;
  variant: "warning" | "muted" | "info" | "error";
}) {
  const variantClasses = {
    warning:
      "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
    muted: "border-border bg-muted/50 text-muted-foreground",
    info: "border-blue-300/50 bg-blue-50/50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
    error:
      "border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]",
  };

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 px-2.5 py-1 text-xs font-normal", variantClasses[variant])}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
  subscriptionMerchantNames,
  onMarkNotSubscription,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const flow = classifyTransaction(transaction);
  const isTransfer = flow === "transfer";
  const isIncome = flow === "income";
  const displayName = transaction.displayName ?? transaction.merchantName ?? transaction.name;
  const merchantKey = transaction.merchantName ?? transaction.name;
  const isDetectedSubscription = subscriptionMerchantNames?.includes(merchantKey) ?? false;

  const hasFlags =
    transaction.isPending ||
    isTransfer ||
    transaction.isExcluded ||
    isDetectedSubscription;

  const sign = isIncome ? "+" : flow === "expense" ? "\u2212" : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* Header — merchant + amount */}
        <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-6">
          <MerchantLogo merchantName={displayName} size={56} />

          <div className="text-center">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {displayName}
            </DialogTitle>
            {transaction.merchantName &&
              transaction.merchantName !== transaction.name && (
                <DialogDescription className="mt-1 text-xs text-muted-foreground">
                  {transaction.name}
                </DialogDescription>
              )}
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2">
            {isTransfer ? (
              <ArrowLeftRight className="size-5 text-muted-foreground" />
            ) : isIncome ? (
              <ArrowUpRight className="size-5 text-[var(--success-text)]" />
            ) : (
              <ArrowDownRight className="size-5 text-[var(--error-text)]" />
            )}
            <span
              className={cn(
                "text-2xl font-bold tabular-nums",
                isTransfer
                  ? "text-muted-foreground"
                  : isIncome
                    ? "text-[var(--success-text)]"
                    : "text-foreground"
              )}
            >
              {sign}
              {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
            </span>
          </div>
        </div>

        {/* Flags */}
        {hasFlags && (
          <div className="flex flex-wrap gap-2 px-6 pt-4">
            {transaction.isPending && (
              <FlagBadge icon={Clock} label="Pending" variant="warning" />
            )}
            {isTransfer && (
              <FlagBadge icon={ArrowLeftRight} label="Transfer" variant="muted" />
            )}
            {transaction.isExcluded && (
              <FlagBadge icon={EyeOff} label="Excluded" variant="error" />
            )}
            {isDetectedSubscription && (
              <FlagBadge icon={Zap} label="Subscription" variant="info" />
            )}
          </div>
        )}

        {/* Details */}
        <div className="px-6 py-4">
          <div className="divide-y divide-border/50">
            <DetailRow icon={Calendar} label="Date">
              {formatDate(transaction.date, "long")}
            </DetailRow>

            {transaction.accountName && (
              <DetailRow icon={CreditCard} label="Account">
                {transaction.accountName}
              </DetailRow>
            )}

            {transaction.category && (
              <DetailRow icon={Tag} label="Category">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={transaction.category} />
                  {transaction.subcategory && (
                    <span className="text-xs text-muted-foreground">
                      / {transaction.subcategory}
                    </span>
                  )}
                </div>
                {transaction.categorySource && (
                  <span className="mt-0.5 text-[10px] text-muted-foreground/50">
                    {categorySourceLabels[transaction.categorySource] ?? transaction.categorySource}
                    {transaction.categoryConfidence != null &&
                      ` \u00b7 ${Math.round(transaction.categoryConfidence * 100)}% confidence`}
                  </span>
                )}
              </DetailRow>
            )}

            {transaction.linkedTransferId && (
              <DetailRow icon={Link2} label="Linked Transfer">
                <span className="text-sm text-muted-foreground">
                  Linked to a matching transaction
                </span>
              </DetailRow>
            )}

            {transaction.note && (
              <DetailRow icon={FileText} label="Note">
                {transaction.note}
              </DetailRow>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 bg-muted/20 px-6 py-3 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/50">
            Added {formatDate(transaction.createdAt, "medium")}
          </p>
          {isDetectedSubscription && onMarkNotSubscription && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onMarkNotSubscription(merchantKey)}
            >
              <ZapOff className="size-3" />
              Not a subscription
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
