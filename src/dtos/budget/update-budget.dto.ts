import { z } from "zod";

export const UpdateBudgetSchema = z.object({
  monthlyBudget: z.number().positive("Monthly budget must be positive"),
});

export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
