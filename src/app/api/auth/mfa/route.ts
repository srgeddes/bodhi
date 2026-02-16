import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedContext } from "@/lib/api-handler";
import { MfaSettingsSchema } from "@/dtos/auth";
import { mfaService } from "@/services";

export const POST = withAuth(async (request: NextRequest, context: AuthenticatedContext) => {
  const body = await request.json();
  const { action } = MfaSettingsSchema.parse(body);

  if (action === "enable") {
    const backupCodes = await mfaService.enableMfa(context.userId);
    return NextResponse.json({
      data: { message: "MFA enabled", backupCodes },
    });
  }

  await mfaService.disableMfa(context.userId);
  return NextResponse.json({
    data: { message: "MFA disabled" },
  });
});
