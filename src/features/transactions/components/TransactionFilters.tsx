"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  SlidersHorizontal,
  X,
  ChevronDown,
  DollarSign,
  Tag,
  CreditCard,
  Clock,
  ArrowLeftRight,
  EyeOff,
  CalendarRange,
  Zap,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import type { AccountResponseDto } from "@/dtos/account";

// ─── Types ──────────────────────────────────────────────────────────

export interface TransactionFilterState {
  dateRange: DateRange | undefined;
  categories: string[];
  accountIds: string[];
  minAmount: string;
  maxAmount: string;
  isPending: boolean | undefined;
  isTransfer: boolean | undefined;
  isExcluded: boolean | undefined;
  isSubscription: boolean | undefined;
}

export const DEFAULT_FILTERS: TransactionFilterState = {
  dateRange: { from: startOfMonth(new Date()), to: new Date() },
  categories: [],
  accountIds: [],
  minAmount: "",
  maxAmount: "",
  isPending: undefined,
  isTransfer: undefined,
  isExcluded: undefined,
  isSubscription: undefined,
};

export const ALL_TIME_FILTERS: TransactionFilterState = {
  ...DEFAULT_FILTERS,
  dateRange: undefined,
};

// ─── Date presets ───────────────────────────────────────────────────

const DATE_PRESETS = [
  {
    label: "This Month",
    range: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: "Last Month",
    range: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "Last 3 Months",
    range: () => ({ from: startOfMonth(subMonths(new Date(), 2)), to: new Date() }),
  },
  {
    label: "Last 6 Months",
    range: () => ({ from: startOfMonth(subMonths(new Date(), 5)), to: new Date() }),
  },
  {
    label: "Year to Date",
    range: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
  {
    label: "Last 12 Months",
    range: () => ({ from: startOfMonth(subMonths(new Date(), 11)), to: new Date() }),
  },
  { label: "All Time", range: () => undefined as DateRange | undefined },
] as const;

// ─── Known categories ───────────────────────────────────────────────

const KNOWN_CATEGORIES = [
  "accommodation",
  "advertising",
  "bar",
  "charity",
  "clothing",
  "dining",
  "education",
  "electronics",
  "entertainment",
  "fuel",
  "general",
  "groceries",
  "health",
  "home",
  "income",
  "insurance",
  "investment",
  "loan",
  "office",
  "phone",
  "service",
  "shopping",
  "software",
  "sport",
  "tax",
  "transport",
  "utilities",
];

function formatCategoryLabel(cat: string): string {
  return cat.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Helper to count active filters ────────────────────────────────

export function countActiveFilters(
  filters: TransactionFilterState,
  isAllTime: boolean
): number {
  let count = 0;
  if (!isAllTime && filters.dateRange) count++; // date range doesn't count when it's the default
  if (isAllTime && !filters.dateRange) count++; // "all time" counts as active since it's non-default
  if (filters.categories.length > 0) count++;
  if (filters.accountIds.length > 0) count++;
  if (filters.minAmount) count++;
  if (filters.maxAmount) count++;
  if (filters.isPending !== undefined) count++;
  if (filters.isTransfer !== undefined) count++;
  if (filters.isExcluded !== undefined) count++;
  if (filters.isSubscription !== undefined) count++;
  return count;
}

// ─── Date label helper ─────────────────────────────────────────────

export function getDateRangeLabel(range: DateRange | undefined): string {
  if (!range) return "All Time";
  if (!range.from) return "All Time";
  const fromStr = format(range.from, "MMM d");
  const toStr = range.to ? format(range.to, "MMM d, yyyy") : "...";
  return `${fromStr} – ${toStr}`;
}

// ─── Filter popover component ──────────────────────────────────────

interface TransactionFilterPopoverProps {
  filters: TransactionFilterState;
  onChange: (filters: TransactionFilterState) => void;
  accounts: AccountResponseDto[];
}

export function TransactionFilterPopover({
  filters,
  onChange,
  accounts,
}: TransactionFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const isDefault =
    filters.dateRange?.from?.getTime() === startOfMonth(new Date()).getTime() &&
    filters.categories.length === 0 &&
    filters.accountIds.length === 0 &&
    !filters.minAmount &&
    !filters.maxAmount &&
    filters.isPending === undefined &&
    filters.isTransfer === undefined &&
    filters.isExcluded === undefined &&
    filters.isSubscription === undefined;

  const isAllTime = !filters.dateRange;
  const activeCount = countActiveFilters(filters, isAllTime);

  const update = (partial: Partial<TransactionFilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const reset = () => {
    onChange({ ...DEFAULT_FILTERS });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5",
            activeCount > 0 && !isDefault && "border-primary/50"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeCount > 0 && !isDefault && (
            <Badge
              variant="secondary"
              className="ml-0.5 size-5 rounded-full p-0 text-[10px] font-semibold"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] max-h-[calc(100vh-8rem)] overflow-y-auto p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium">Filters</span>
          {!isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-auto px-2 py-1 text-xs text-muted-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="space-y-1 p-4">
          {/* ─── Date Range ──────────────────────── */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <CalendarRange className="size-3" />
              Date Range
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DATE_PRESETS.map((preset) => {
                const presetRange = preset.range();
                const isActive =
                  (!presetRange && !filters.dateRange) ||
                  (presetRange &&
                    filters.dateRange &&
                    presetRange.from?.getTime() === filters.dateRange.from?.getTime() &&
                    presetRange.to?.getTime() === filters.dateRange.to?.getTime());

                return (
                  <Button
                    key={preset.label}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => update({ dateRange: preset.range() })}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            {/* Custom date picker */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full justify-start gap-2 text-xs h-8"
                >
                  <CalendarDays className="size-3.5" />
                  {filters.dateRange
                    ? getDateRangeLabel(filters.dateRange)
                    : "All Time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) => {
                    update({ dateRange: range });
                    if (range?.to) setDatePickerOpen(false);
                  }}
                  numberOfMonths={2}
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="my-3" />

          {/* ─── Categories ──────────────────────── */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Tag className="size-3" />
              Categories
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto">
              {KNOWN_CATEGORIES.map((cat) => {
                const isSelected = filters.categories.includes(cat);
                return (
                  <Button
                    key={cat}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      const next = isSelected
                        ? filters.categories.filter((c) => c !== cat)
                        : [...filters.categories, cat];
                      update({ categories: next });
                    }}
                  >
                    {formatCategoryLabel(cat)}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="my-3" />

          {/* ─── Accounts ────────────────────────── */}
          {accounts.length > 0 && (
            <>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <CreditCard className="size-3" />
                  Accounts
                </Label>
                <div className="flex flex-col gap-1.5 mt-2 max-h-32 overflow-y-auto">
                  {accounts.map((acc) => {
                    const isSelected = filters.accountIds.includes(acc.id);
                    return (
                      <label
                        key={acc.id}
                        className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const next = checked
                              ? [...filters.accountIds, acc.id]
                              : filters.accountIds.filter((id) => id !== acc.id);
                            update({ accountIds: next });
                          }}
                        />
                        <span className="text-xs text-foreground truncate flex-1">
                          {acc.name}
                        </span>
                        {acc.mask && (
                          <span className="text-[10px] tabular-nums text-muted-foreground/60">
                            ••{acc.mask}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
              <Separator className="my-3" />
            </>
          )}

          {/* ─── Amount Range ────────────────────── */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <DollarSign className="size-3" />
              Amount Range
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) => update({ minAmount: e.target.value })}
                className="h-8 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) => update({ maxAmount: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <Separator className="my-3" />

          {/* ─── Status Flags ────────────────────── */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2">
              Status
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <TogglePill
                icon={Clock}
                label="Pending"
                value={filters.isPending}
                onChange={(v) => update({ isPending: v })}
              />
              <TogglePill
                icon={ArrowLeftRight}
                label="Transfers"
                value={filters.isTransfer}
                onChange={(v) => update({ isTransfer: v })}
              />
              <TogglePill
                icon={EyeOff}
                label="Excluded"
                value={filters.isExcluded}
                onChange={(v) => update({ isExcluded: v })}
              />
              <TogglePill
                icon={Zap}
                label="Subscriptions"
                value={filters.isSubscription}
                onChange={(v) => update({ isSubscription: v })}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground/50">
              Click once to show only, click again to hide, click to clear
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Toggle pill (3-state: undefined → true → false → undefined) ───

function TogglePill({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Clock;
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  const handleClick = () => {
    if (value === undefined) onChange(true);
    else if (value === true) onChange(false);
    else onChange(undefined);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-7 gap-1.5 text-xs px-2.5",
        value === true && "border-primary/50 bg-primary/5 text-primary",
        value === false && "border-destructive/50 bg-destructive/5 text-destructive line-through"
      )}
      onClick={handleClick}
    >
      <Icon className="size-3" />
      {label}
      {value === true && (
        <span className="text-[9px] font-semibold">ONLY</span>
      )}
      {value === false && (
        <span className="text-[9px] font-semibold">HIDE</span>
      )}
    </Button>
  );
}

// ─── Active filter pills (shown below the toolbar) ─────────────────

interface ActiveFilterPillsProps {
  filters: TransactionFilterState;
  onChange: (filters: TransactionFilterState) => void;
  accounts: AccountResponseDto[];
}

export function ActiveFilterPills({
  filters,
  onChange,
  accounts,
}: ActiveFilterPillsProps) {
  const pills: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.dateRange) {
    pills.push({
      key: "date",
      label: getDateRangeLabel(filters.dateRange),
      onRemove: () => onChange({ ...filters, dateRange: undefined }),
    });
  }

  for (const cat of filters.categories) {
    pills.push({
      key: `cat-${cat}`,
      label: formatCategoryLabel(cat),
      onRemove: () =>
        onChange({
          ...filters,
          categories: filters.categories.filter((c) => c !== cat),
        }),
    });
  }

  for (const accId of filters.accountIds) {
    const acc = accounts.find((a) => a.id === accId);
    pills.push({
      key: `acc-${accId}`,
      label: acc ? acc.name : accId.slice(0, 8),
      onRemove: () =>
        onChange({
          ...filters,
          accountIds: filters.accountIds.filter((id) => id !== accId),
        }),
    });
  }

  if (filters.minAmount) {
    pills.push({
      key: "min",
      label: `Min $${filters.minAmount}`,
      onRemove: () => onChange({ ...filters, minAmount: "" }),
    });
  }

  if (filters.maxAmount) {
    pills.push({
      key: "max",
      label: `Max $${filters.maxAmount}`,
      onRemove: () => onChange({ ...filters, maxAmount: "" }),
    });
  }

  if (filters.isPending !== undefined) {
    pills.push({
      key: "pending",
      label: filters.isPending ? "Pending only" : "No pending",
      onRemove: () => onChange({ ...filters, isPending: undefined }),
    });
  }

  if (filters.isTransfer !== undefined) {
    pills.push({
      key: "transfer",
      label: filters.isTransfer ? "Transfers only" : "No transfers",
      onRemove: () => onChange({ ...filters, isTransfer: undefined }),
    });
  }

  if (filters.isExcluded !== undefined) {
    pills.push({
      key: "excluded",
      label: filters.isExcluded ? "Excluded only" : "No excluded",
      onRemove: () => onChange({ ...filters, isExcluded: undefined }),
    });
  }

  if (filters.isSubscription !== undefined) {
    pills.push({
      key: "subscription",
      label: filters.isSubscription ? "Subscriptions only" : "No subscriptions",
      onRemove: () => onChange({ ...filters, isSubscription: undefined }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {pills.map((pill) => (
        <Badge
          key={pill.key}
          variant="secondary"
          className="gap-1 px-2 py-0.5 text-xs font-normal"
        >
          {pill.label}
          <button
            onClick={pill.onRemove}
            className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
          >
            <X className="size-2.5" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
