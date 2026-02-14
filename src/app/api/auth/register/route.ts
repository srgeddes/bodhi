import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { RegisterSchema } from "@/dtos/auth";
import { userService } from "@/services";
import { UserMapper } from "@/mappers";
import { setAuthCookie } from "@/lib/auth";

export const POST = withoutAuth(async (request: NextRequest) => {
  const body = await request.json();
  const dto = RegisterSchema.parse(body);
  const { user, token } = await userService.register(dto);

  const response = NextResponse.json(
    {
      data: {
        user: UserMapper.toDto(user),
        token,
      },
    },
    { status: 201 }
  );

  setAuthCookie(response, token);
  return response;
});
