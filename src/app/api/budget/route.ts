import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthenticatedContext } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { UpdateBudgetSchema } from "@/dtos/budget";
import type { BudgetResponseDto } from "@/dtos/budget";

export const GET = withAuth(async (_request: NextRequest, context: AuthenticatedContext) => {
  const { userId } = context;

  // Sum spending this month (negative amounts, not transfers, not excluded)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [user, spendingResult] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { monthlyBudget: true } }),
    prisma.transaction.aggregate({
      where: {
        userId,
        date: { gte: monthStart },
        amount: { lt: 0 },
        isTransfer: false,
        isExcluded: false,
      },
      _sum: { amount: true },
    }),
  ]);

  const spent = Math.abs(spendingResult._sum.amount?.toNumber() ?? 0);
  const budget = user.monthlyBudget?.toNumber() ?? null;
  const remaining = budget != null ? budget - spent : 0;
  const percentUsed = budget != null && budget > 0 ? (spent / budget) * 100 : 0;

  // Days remaining in month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDay - now.getDate();

  const response: BudgetResponseDto = {
    monthlyBudget: budget,
    spent: Math.round(spent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    percentUsed: Math.round(percentUsed * 10) / 10,
    daysRemaining,
  };

  return NextResponse.json(response);
});

export const PATCH = withAuth(async (request: NextRequest, context: AuthenticatedContext) => {
  const { userId } = context;
  const body = await request.json();
  const { monthlyBudget } = UpdateBudgetSchema.parse(body);

  await prisma.user.update({
    where: { id: userId },
    data: { monthlyBudget },
  });

  return NextResponse.json({ monthlyBudget });
});
