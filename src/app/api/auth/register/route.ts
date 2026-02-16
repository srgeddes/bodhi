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

  const response = NextResponse.json({
    data: {
      user: UserMapper.toDto(result.user),
    },
  }, { status: 201 });

  setAuthCookie(response, result.token);

  return response;
});
