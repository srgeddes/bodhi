import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tellerEnrollmentService } from "@/services";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeEnrollments = await prisma.tellerEnrollment.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, enrollmentId: true },
  });

  let synced = 0;
  let failed = 0;

  // Process in chunks of 5 to avoid overwhelming DB/Teller API
  const CONCURRENCY_LIMIT = 5;
  for (let i = 0; i < activeEnrollments.length; i += CONCURRENCY_LIMIT) {
    const chunk = activeEnrollments.slice(i, i + CONCURRENCY_LIMIT);
    const results = await Promise.allSettled(
      chunk.map((enrollment) =>
        tellerEnrollmentService.syncTransactions(enrollment.id)
      )
    );

    for (let j = 0; j < results.length; j++) {
      if (results[j].status === "fulfilled") {
        synced++;
      } else {
        failed++;
        const reason = (results[j] as PromiseRejectedResult).reason;
        logger.error("Cron sync failed for TellerEnrollment", {
          enrollmentId: chunk[j].id,
          error: reason instanceof Error ? reason.message : "Unknown error",
        });
      }
    }
  }

  logger.info("Cron sync completed", { synced, failed, total: activeEnrollments.length });

  return NextResponse.json({
    synced,
    failed,
    total: activeEnrollments.length,
  });
}
