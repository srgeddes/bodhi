import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/domain/errors";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";
import { UnauthorizedError } from "@/domain/errors";
import { logger } from "@/lib/logger";

export interface AuthenticatedContext {
  userId: string;
  params: Record<string, string>;
}

type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse>;

type UnauthenticatedHandler = (
  request: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

type RouteContext = { params: Promise<Record<string, string>> };

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    try {
      const token = extractTokenFromRequest(request);
      if (!token) {
        throw new UnauthorizedError("Authentication required");
      }

      const payload = verifyToken(token);
      const params = await context.params;
      return await handler(request, { userId: payload.userId, params });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function withoutAuth(handler: UnauthenticatedHandler) {
  return async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    try {
      const params = await context.params;
      return await handler(request, { params });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorCode = (error as Record<string, unknown>)?.code;

  logger.error("Unhandled error", {
    message: errorMessage,
    name: errorName,
    code: errorCode as string | undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    {
      error: "Internal server error",
      // TEMP DEBUG — remove after fixing production issue
      debug: { name: errorName, message: errorMessage, code: errorCode },
    },
    { status: 500 }
  );
}
