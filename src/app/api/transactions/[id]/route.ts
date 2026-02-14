import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { transactionService } from "@/services";
import { TransactionMapper } from "@/mappers";
import { UpdateTransactionSchema } from "@/dtos/transaction";

export const GET = withAuth(async (_request: NextRequest, { userId, params }) => {
  const txn = await transactionService.findByIdForUser(params.id, userId);
  return NextResponse.json({ data: TransactionMapper.toDto(txn) });
});

export const PATCH = withAuth(async (request: NextRequest, { userId, params }) => {
  const body = await request.json();
  const dto = UpdateTransactionSchema.parse(body);
  const txn = await transactionService.updateTransaction(params.id, userId, dto);
  return NextResponse.json({ data: TransactionMapper.toDto(txn) });
});
