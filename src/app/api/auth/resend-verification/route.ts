import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { ResendVerificationSchema } from "@/dtos/auth";
import { verificationService } from "@/services";
import { checkResendVerificationRateLimit, getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

export const POST = withoutAuth(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkResendVerificationRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { email } = ResendVerificationSchema.parse(body);

  // Find user by email — always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await verificationService.resendVerification(user.id);
  }

  return NextResponse.json({
    data: { message: "If an account exists with that email, a verification link has been sent." },
  });
});
