import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { JWT_COOKIE_NAME, JWT_EXPIRY_SECONDS } from "@/config/constants";

interface TokenPayload {
  userId: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: JWT_EXPIRY_SECONDS,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(JWT_COOKIE_NAME);
  if (cookie) return cookie.value;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: JWT_EXPIRY_SECONDS,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(JWT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
