import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(1000),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  status: z.enum(["authenticated", "verification_required", "mfa_required"]),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    emailVerified: z.boolean(),
    mfaEnabled: z.boolean(),
  }).optional(),
  tempToken: z.string().optional(),
  message: z.string().optional(),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
