import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { accountService } from "@/services";
import { AccountMapper } from "@/mappers";

export const GET = withAuth(async (_request: NextRequest, { userId, params }) => {
  const account = await accountService.findByIdForUser(params.id, userId);
  return NextResponse.json({ data: AccountMapper.toDto(account) });
});

export const PATCH = withAuth(async (request: NextRequest, { userId, params }) => {
  const body = await request.json();

  if (body.isHidden === true) {
    const account = await accountService.hideAccount(params.id, userId);
    return NextResponse.json({ data: AccountMapper.toDto(account) });
  }

  if (body.isHidden === false) {
    const account = await accountService.unhideAccount(params.id, userId);
    return NextResponse.json({ data: AccountMapper.toDto(account) });
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
});
