import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { TellerConnectSuccessSchema } from "@/dtos/teller";
import { tellerEnrollmentService } from "@/services";
import { TellerEnrollmentMapper, AccountMapper } from "@/mappers";

export const POST = withAuth(async (request: NextRequest, { userId }) => {
  const body = await request.json();
  const dto = TellerConnectSuccessSchema.parse(body);
  const { enrollment, accounts } = await tellerEnrollmentService.connectAccount(userId, dto);

  return NextResponse.json(
    {
      data: {
        enrollment: TellerEnrollmentMapper.toDto(enrollment),
        accounts: AccountMapper.toDtoList(accounts),
      },
    },
    { status: 201 }
  );
});
