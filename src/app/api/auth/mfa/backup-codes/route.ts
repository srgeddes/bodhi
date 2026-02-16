import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedContext } from "@/lib/api-handler";
import { mfaService } from "@/services";

export const POST = withAuth(async (_request: NextRequest, context: AuthenticatedContext) => {
  const backupCodes = await mfaService.regenerateBackupCodes(context.userId);
  return NextResponse.json({
    data: { backupCodes },
  });
});
