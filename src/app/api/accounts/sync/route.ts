import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import { tellerEnrollmentService } from "@/services";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (_request, { userId }) => {
  const activeEnrollments = await prisma.tellerEnrollment.findMany({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    activeEnrollments.map((enrollment) =>
      tellerEnrollmentService.syncTransactions(enrollment.id)
    )
  );

  let synced = 0;
  let failed = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "fulfilled") {
      synced++;
    } else {
      failed++;
      const reason = (results[i] as PromiseRejectedResult).reason;
      logger.error("Manual sync failed for TellerEnrollment", {
        enrollmentId: activeEnrollments[i].id,
        userId,
        error: reason instanceof Error ? reason.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    data: { synced, failed, total: activeEnrollments.length },
  });
});
