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

  const response = NextResponse.json({
    data: {
      user: UserMapper.toDto(result.user),
    },
  });

  setAuthCookie(response, result.token);

  return response;
});
