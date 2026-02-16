import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { accountService } from "@/services";
import { AccountMapper } from "@/mappers";
import { UpdateAccountSchema } from "@/dtos/account/update-account.dto";

export const GET = withAuth(async (_request: NextRequest, { userId, params }) => {
  const account = await accountService.findByIdForUser(params.id, userId);
  return NextResponse.json({ data: AccountMapper.toDto(account) });
});

export const PATCH = withAuth(async (request: NextRequest, { userId, params }) => {
  const body = await request.json();
  const { isHidden } = UpdateAccountSchema.parse(body);

  const account = isHidden
    ? await accountService.hideAccount(params.id, userId)
    : await accountService.unhideAccount(params.id, userId);

  return NextResponse.json({ data: AccountMapper.toDto(account) });
});
