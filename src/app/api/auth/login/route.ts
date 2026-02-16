import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { LoginSchema } from "@/dtos/auth";
import { userService } from "@/services";
import { UserMapper } from "@/mappers";
import { setAuthCookie } from "@/lib/auth";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = withoutAuth(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const dto = LoginSchema.parse(body);
  const result = await userService.login(dto);

  const responseBody: Record<string, unknown> = {
    data: {
      status: result.status,
      user: UserMapper.toDto(result.user),
    },
  };

  if (result.status === "mfa_required") {
    (responseBody.data as Record<string, unknown>).tempToken = result.tempToken;
  }

  if (result.status === "verification_required") {
    (responseBody.data as Record<string, unknown>).message = "Please verify your email address";
  }

  const response = NextResponse.json(responseBody);

  // Only set auth cookie if fully authenticated
  if (result.status === "authenticated" && result.token) {
    setAuthCookie(response, result.token);
  }

  return response;
});
