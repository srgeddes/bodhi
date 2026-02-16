import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { VerifyEmailSchema } from "@/dtos/auth";
import { verificationService, userService } from "@/services";
import { UserMapper } from "@/mappers";
import { signToken, setAuthCookie } from "@/lib/auth";

export const POST = withoutAuth(async (request: NextRequest) => {
  const body = await request.json();
  const { token } = VerifyEmailSchema.parse(body);

  const userId = await verificationService.verifyEmail(token);

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
