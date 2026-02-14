"use client";

import { Fragment, useMemo } from "react";
import { isToday, isYesterday, format, parseISO } from "date-fns";
import { CategoryBadge } from "./CategoryBadge";
import { MerchantLogo } from "@/components/MerchantLogo";
import { TransactionAmount } from "@/components/TransactionAmount";
import { isIncome } from "@/utils/transaction.utils";
import { formatCurrency } from "@/utils/format.utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { TransactionResponseDto } from "@/dtos/transaction";

interface TransactionTableProps {
  transactions: TransactionResponseDto[];
  onTransactionClick?: (transaction: TransactionResponseDto) => void;
  aggregates?: { totalIncome: number; totalExpenses: number };
}

function formatDateGroupLabel(dateStr: string): string {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
}

function groupByDate(transactions: TransactionResponseDto[]) {
  const groups: { dateKey: string; label: string; transactions: TransactionResponseDto[] }[] = [];
  const map = new Map<string, TransactionResponseDto[]>();

  for (const txn of transactions) {
    const dateKey = typeof txn.date === "string" ? txn.date.slice(0, 10) : format(txn.date, "yyyy-MM-dd");
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey)!.push(txn);
  }

  for (const [dateKey, txns] of map) {
    groups.push({
      dateKey,
      label: formatDateGroupLabel(dateKey),
      transactions: txns,
    });
  }

  return groups;
}

export function TransactionTable({ transactions, onTransactionClick, aggregates }: TransactionTableProps) {
  const income = aggregates?.totalIncome ?? 0;
  const expenses = aggregates?.totalExpenses ?? 0;
  const net = income - expenses;

  const dateGroups = useMemo(() => groupByDate(transactions), [transactions]);

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      {transactions.length > 0 && (
        <div className="flex items-center gap-6 px-1 py-2 text-sm">
          <span className="text-muted-foreground">
            Income{" "}
            <span className="font-medium tabular-nums text-[var(--success-text)]">
              +{formatCurrency(income)}
            </span>
          </span>
          <span className="text-muted-foreground/40">&middot;</span>
          <span className="text-muted-foreground">
            Expenses{" "}
            <span className="font-medium tabular-nums text-[var(--error-text)]">
              &minus;{formatCurrency(expenses)}
            </span>
          </span>
          <span className="text-muted-foreground/40">&middot;</span>
          <span className="text-muted-foreground">
            Net{" "}
            <span className="font-medium tabular-nums text-foreground">
              {net > 0 && "+"}
              {net < 0 && "\u2212"}
              {formatCurrency(Math.abs(net))}
            </span>
          </span>
        </div>
      )}

      {/* Transaction table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Description</TableHead>
              <TableHead className="hidden sm:table-cell w-[140px]">Category</TableHead>
              <TableHead className="w-[130px] pr-4 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dateGroups.map((group) => (
              <Fragment key={group.dateKey}>
                {/* Date separator row */}
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-0">
                  <TableCell
                    colSpan={3}
                    className="py-1.5 pl-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60"
                  >
                    {group.label}
                  </TableCell>
                </TableRow>

                {/* Transaction rows */}
                {group.transactions.map((txn) => {
                  const transfer = txn.isTransfer ?? false;
                  const displayName = txn.displayName ?? txn.merchantName ?? txn.name;

                  return (
                    <TableRow
                      key={txn.id}
                      className="cursor-pointer"
                      onClick={() => onTransactionClick?.(txn)}
                    >
                      {/* Description cell */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-3">
                          <MerchantLogo merchantName={displayName} size={32} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-foreground">
                                {displayName}
                              </span>
                              {txn.isPending && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--warning-text)]">
                                  <span className="size-1.5 rounded-full bg-[var(--warning-text)]" />
                                  Pending
                                </span>
                              )}
                              {transfer && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                                  Transfer
                                </span>
                              )}
                            </div>
                            {txn.merchantName && txn.merchantName !== txn.name && (
                              <p className="truncate text-xs text-muted-foreground/70">
                                {txn.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category cell */}
                      <TableCell className="hidden sm:table-cell">
                        {txn.category ? (
                          <CategoryBadge category={txn.category} />
                        ) : (
                          <span className="text-xs text-muted-foreground/50">--</span>
                        )}
                      </TableCell>

                      {/* Amount cell */}
                      <TableCell className="pr-4 text-right">
                        <TransactionAmount
                          amount={txn.amount}
                          isTransfer={transfer}
                          showIcon
                          className="justify-end"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
