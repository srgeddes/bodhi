import { z } from "zod";

export const BudgetResponseSchema = z.object({
  monthlyBudget: z.number().nullable(),
  spent: z.number(),
  remaining: z.number(),
  percentUsed: z.number(),
  daysRemaining: z.number(),
});

export type BudgetResponseDto = z.infer<typeof BudgetResponseSchema>;
