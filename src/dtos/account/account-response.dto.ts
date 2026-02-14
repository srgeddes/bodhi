import { z } from "zod";

export const AccountResponseSchema = z.object({
  id: z.string(),
  tellerEnrollmentId: z.string(),
  name: z.string(),
  officialName: z.string().nullable(),
  type: z.string(),
  subtype: z.string().nullable(),
  mask: z.string().nullable(),
  currentBalance: z.number().nullable(),
  availableBalance: z.number().nullable(),
  limitAmount: z.number().nullable(),
  currency: z.string(),
  displayBalance: z.number().nullable(),
  isHidden: z.boolean(),
  institutionId: z.string().nullable(),
  institutionName: z.string().nullable(),
  lastSyncedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AccountResponseDto = z.infer<typeof AccountResponseSchema>;

export const AccountFilterSchema = z.object({
  type: z.string().optional(),
  isHidden: z.coerce.boolean().optional(),
});

export type AccountFilterDto = z.infer<typeof AccountFilterSchema>;
