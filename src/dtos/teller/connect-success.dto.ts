import { z } from "zod";

export const TellerConnectSuccessSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  enrollmentId: z.string().min(1, "Enrollment ID is required"),
  institutionName: z.string().optional(),
});

export type TellerConnectSuccessDto = z.infer<typeof TellerConnectSuccessSchema>;
