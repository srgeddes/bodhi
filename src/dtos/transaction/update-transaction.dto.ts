import { z } from "zod";

export const UpdateTransactionSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().nullable().optional(),
  isExcluded: z.boolean().optional(),
  note: z.string().nullable().optional(),
});

export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
