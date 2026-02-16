import { z } from "zod";

export const UpdateAccountSchema = z.object({
  isHidden: z.boolean(),
});

export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
