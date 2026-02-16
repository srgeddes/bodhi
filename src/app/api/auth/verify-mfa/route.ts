import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { VerifyMfaSchema } from "@/dtos/auth";
import { mfaService, userService } from "@/services";
import { UserMapper } from "@/mappers";
import { verifyMfaTempToken, signToken, setAuthCookie } from "@/lib/auth";
import { UnauthorizedError } from "@/domain/errors";
import { checkMfaRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = withoutAuth(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkMfaRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { code, tempToken } = VerifyMfaSchema.parse(body);

  // Verify the MFA temp token
  const payload = verifyMfaTempToken(tempToken);
  const userId = payload.userId;

  // Try MFA code first, then backup code
  const isOtpValid = await mfaService.verifyMfaCode(userId, code);
  const isBackupValid = !isOtpValid && code.length === 8
    ? await mfaService.verifyBackupCode(userId, code)
    : false;

  if (!isOtpValid && !isBackupValid) {
    throw new UnauthorizedError("Invalid verification code");
  }

  const user = await userService.findById(userId);
  const authToken = signToken(userId);

  const response = NextResponse.json({
    data: {
      status: "authenticated",
      user: user ? UserMapper.toDto(user) : null,
    },
  });

  setAuthCookie(response, authToken);
  return response;
});
