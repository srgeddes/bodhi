import { z } from "zod";

export const VerifyMfaSchema = z.object({
  code: z.string().min(6, "Code is required").max(8),
  tempToken: z.string().min(1, "Temp token is required"),
});

export type VerifyMfaDto = z.infer<typeof VerifyMfaSchema>;
