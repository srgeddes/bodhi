import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/config/constants";

export const TransactionFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  accountIds: z
    .string()
    .transform((s) => s.split(",").filter(Boolean))
    .optional(),
  categories: z
    .string()
    .transform((s) => s.split(",").filter(Boolean))
    .optional(),
  search: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  isTransfer: z.coerce.boolean().optional(),
  isPending: z.coerce.boolean().optional(),
  isExcluded: z.coerce.boolean().optional(),
  isRecurring: z.coerce.boolean().optional(),
  merchantNames: z
    .string()
    .transform((s) => s.split(",").filter(Boolean))
    .optional(),
  limit: z.coerce.number().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  offset: z.coerce.number().min(0).default(0),
});

export type TransactionFilterDto = z.infer<typeof TransactionFilterSchema>;
