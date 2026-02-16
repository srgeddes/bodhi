import { NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { signToken, setAuthCookie } from "@/lib/auth";
import { seedDemoUser } from "@/lib/demo-seed";
import { prisma } from "@/lib/db";
import { UserMapper } from "@/mappers";

export const POST = withoutAuth(async () => {
  const userId = await seedDemoUser();

  const raw = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const user = UserMapper.toDomain(raw as unknown as Record<string, unknown>);
  const token = signToken(userId);

  const response = NextResponse.json({
    data: {
      user: UserMapper.toDto(user),
    },
  });

  setAuthCookie(response, token);
  return response;
});
