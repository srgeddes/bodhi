import { NextResponse } from "next/server";
import { withAuth, type AuthenticatedContext } from "@/lib/api-handler";
import { userService } from "@/services";
import { UserMapper } from "@/mappers";

export const GET = withAuth(async (_request, context: AuthenticatedContext) => {
  const user = await userService.findById(context.userId);
  return NextResponse.json({ data: { user: UserMapper.toDto(user) } });
});
