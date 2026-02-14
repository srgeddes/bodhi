import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { transactionService } from "@/services";
import { TransactionMapper } from "@/mappers";
import { TransactionFilterSchema } from "@/dtos/transaction";
import { PaginatedResponse } from "@/types/api.types";
import { TransactionResponseDto } from "@/dtos/transaction";

export const GET = withAuth(async (request: NextRequest, { userId }) => {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = TransactionFilterSchema.parse(searchParams);

  const { transactions, total, aggregates } = await transactionService.findByUserId(userId, {
    ...filters,
    userId,
    includeAccountName: true,
  });

  const data = TransactionMapper.toDtoList(transactions);

  const response: PaginatedResponse<TransactionResponseDto> = {
    data,
    total,
    limit: filters.limit,
    offset: filters.offset,
    hasMore: filters.offset + filters.limit < total,
    aggregates: {
      totalIncome: aggregates.totalIncome,
      totalExpenses: aggregates.totalExpenses,
    },
  };

  return NextResponse.json(response);
});
