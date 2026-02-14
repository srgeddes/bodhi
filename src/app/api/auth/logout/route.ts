import { NextRequest, NextResponse } from "next/server";
import { withoutAuth } from "@/lib/api-handler";
import { clearAuthCookie } from "@/lib/auth";

export const POST = withoutAuth(async () => {
  const response = NextResponse.json({ data: { message: "Logged out" } });
  clearAuthCookie(response);
  return response;
});

// GET handler: clears cookie and redirects to landing page.
// Used by client logout for instant navigation (no JS fetch needed).
export async function GET(request: NextRequest) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);
  clearAuthCookie(response);
  return response;
}
