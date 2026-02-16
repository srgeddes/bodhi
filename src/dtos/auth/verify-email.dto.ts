import { z } from "zod";

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ResendVerificationDto = z.infer<typeof ResendVerificationSchema>;
