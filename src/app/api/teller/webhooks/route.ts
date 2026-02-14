import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { tellerEnrollmentService } from "@/services";
import { logger } from "@/lib/logger";
import crypto from "crypto";

function verifyTellerSignature(body: string, signatureHeader: string | null): boolean {
  const secret = process.env.TELLER_SIGNING_SECRET;
  if (!secret || !signatureHeader) return false;

  // Parse "t=timestamp,v1=signature" format
  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=", 2);
    parts[key] = value;
  }

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const payload = `${timestamp}.${body}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

export const POST = withoutAuth(async (request: NextRequest) => {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("teller-signature");

  if (!verifyTellerSignature(rawBody, signatureHeader)) {
    logger.warn("Invalid Teller webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const { type, payload } = body;
  const enrollmentId = payload?.enrollment_id;

  logger.info("Teller webhook received", { type, enrollmentId });

  if (!type || !enrollmentId) {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  // Process webhook asynchronously — return 200 immediately
  tellerEnrollmentService
    .handleWebhook(type, enrollmentId)
    .catch((error) => {
      logger.error("Webhook processing failed", {
        type,
        enrollmentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });

  return NextResponse.json({ data: { received: true } });
});
