import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { JWT_COOKIE_NAME } from "@/config/constants";

// Auth-related pages that don't require a session cookie
const PUBLIC_AUTH_PATHS = ["/login", "/register", "/verify-email", "/mfa-verify"];

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has(JWT_COOKIE_NAME);

  // Redirect authenticated users to dashboard from landing/auth pages
  if (hasToken && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow demo routes without auth
  if (pathname.startsWith("/demo")) {
    return NextResponse.next();
  }

  // Allow public auth paths (verify-email, mfa-verify)
  if (isPublicAuthPath(pathname)) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!hasToken && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
