import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { JWT_COOKIE_NAME, JWT_EXPIRY_SECONDS, MFA_TEMP_TOKEN_EXPIRY_SECONDS } from "@/config/constants";

interface TokenPayload {
  userId: string;
}

interface MfaTempTokenPayload {
  userId: string;
  purpose: "mfa";
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: JWT_EXPIRY_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET!, {
    algorithms: ["HS256"],
  }) as TokenPayload & { purpose?: string };

  // Reject MFA temp tokens used as session tokens
  if (payload.purpose) {
    throw new Error("Invalid token type");
  }

  return { userId: payload.userId };
}

export function signMfaTempToken(userId: string): string {
  return jwt.sign({ userId, purpose: "mfa" }, process.env.JWT_SECRET!, {
    expiresIn: MFA_TEMP_TOKEN_EXPIRY_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyMfaTempToken(token: string): MfaTempTokenPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET!, {
    algorithms: ["HS256"],
  }) as MfaTempTokenPayload;

  if (payload.purpose !== "mfa") {
    throw new Error("Invalid MFA token");
  }

  return payload;
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
    sameSite: "strict",
    maxAge: JWT_EXPIRY_SECONDS,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(JWT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}
