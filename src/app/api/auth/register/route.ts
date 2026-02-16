import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { RegisterSchema } from "@/dtos/auth";
import { userService } from "@/services";
import { UserMapper } from "@/mappers";
import { setAuthCookie } from "@/lib/auth";
import { checkRegisterRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = withoutAuth(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkRegisterRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const dto = RegisterSchema.parse(body);
  const result = await userService.register(dto);

  const responseBody: Record<string, unknown> = {
    data: {
      status: result.status,
      user: UserMapper.toDto(result.user),
      message: "Check your email to verify your account",
    },
  };

  const response = NextResponse.json(responseBody, { status: 201 });

  // Only set cookie if fully authenticated (e.g. demo users)
  if (result.status === "authenticated" && result.token) {
    setAuthCookie(response, result.token);
  }

  return response;
});
