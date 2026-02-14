import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { accountService } from "@/services";
import { AccountMapper } from "@/mappers";

export const GET = withAuth(async (_request, { userId }) => {
  const results = await accountService.findByUserIdWithInstitution(userId);
  const data = results.map(({ account, institutionName }) => ({
    ...AccountMapper.toDto(account),
    institutionName,
  }));
  return NextResponse.json({ data });
});
