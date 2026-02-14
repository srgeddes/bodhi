import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api-handler";
import { transactionService } from "@/services";

export const GET = withAuth(async (_request: NextRequest, { userId }) => {
  const merchants = await transactionService.getSubscriptionMerchants(userId);
  return NextResponse.json({ data: merchants });
});

const OverrideSchema = z.object({
  merchantName: z.string().min(1),
});

export const POST = withAuth(async (request: NextRequest, { userId }) => {
  const body = await request.json();
  const { merchantName } = OverrideSchema.parse(body);
  await transactionService.addSubscriptionOverride(userId, merchantName);
  return NextResponse.json({ success: true }, { status: 201 });
});

export const DELETE = withAuth(async (request: NextRequest, { userId }) => {
  const merchantName = request.nextUrl.searchParams.get("merchantName");
  if (!merchantName) {
    return NextResponse.json({ error: "merchantName is required" }, { status: 400 });
  }
  await transactionService.removeSubscriptionOverride(userId, merchantName);
  return NextResponse.json({ success: true });
});
