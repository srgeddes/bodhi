import { z } from "zod";

export const TransactionResponseSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  accountName: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  name: z.string(),
  merchantName: z.string().nullable(),
  displayName: z.string(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  categoryConfidence: z.number().nullable(),
  categorySource: z.string().nullable(),
  isTransfer: z.boolean(),
  linkedTransferId: z.string().nullable(),
  isPending: z.boolean(),
  isRecurring: z.boolean(),
  isExcluded: z.boolean(),
  note: z.string().nullable(),
  tellerType: z.string().nullable(),
  tellerStatus: z.string().nullable(),
  processingStatus: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TransactionResponseDto = z.infer<typeof TransactionResponseSchema>;
