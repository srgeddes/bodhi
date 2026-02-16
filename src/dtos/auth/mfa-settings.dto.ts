import { z } from "zod";

export const MfaSettingsSchema = z.object({
  action: z.enum(["enable", "disable"]),
});

export type MfaSettingsDto = z.infer<typeof MfaSettingsSchema>;
