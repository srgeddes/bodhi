import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthenticatedContext } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { SaveDashboardLayoutSchema } from "@/dtos/dashboard/dashboard-layout.dto";

const DEFAULT_LAYOUT = {
  widgets: [
    { id: "w1", type: "net-worth", title: "Net Worth", settings: {} },
    { id: "w2", type: "current-budget", title: "Current Budget", settings: {} },
    { id: "w3", type: "recent-transactions", title: "This Month's Transactions", settings: {} },
  ],
  layout: [
    { i: "w1", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "w2", x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "w3", x: 0, y: 4, w: 12, h: 5, minW: 6, minH: 4 },
  ],
};

export const GET = withAuth(async (_request: NextRequest, context: AuthenticatedContext) => {
  const { userId } = context;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { dashboardLayout: true },
  });

  const data = (user.dashboardLayout as Record<string, unknown>) ?? DEFAULT_LAYOUT;
  return NextResponse.json(data);
});

export const PUT = withAuth(async (request: NextRequest, context: AuthenticatedContext) => {
  const { userId } = context;
  const body = await request.json();
  const validated = SaveDashboardLayoutSchema.parse(body);

  await prisma.user.update({
    where: { id: userId },
    data: { dashboardLayout: JSON.parse(JSON.stringify(validated)) },
  });

  return NextResponse.json({ success: true });
});
