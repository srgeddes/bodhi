const mockJson = jest.fn(
  (body: unknown, init?: { status?: number }) => ({ body, status: init?.status })
);

jest.mock("next/server", () => ({
  NextResponse: { json: (...args: unknown[]) => mockJson(...args) },
  NextRequest: jest.fn(),
}));

import { z } from "zod";
import { handleApiError } from "../api-handler";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  TellerError,
  AiError,
} from "@/domain/errors";

describe("handleApiError", () => {
  beforeEach(() => {
    mockJson.mockClear();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 400 with fieldErrors for a ZodError", () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(0),
    });

    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ email: "not-an-email", age: -5 });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    const result = handleApiError(zodError!);

    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty("error", "Validation failed");
    expect(result.body).toHaveProperty("fieldErrors");
    expect(result.body.fieldErrors).toHaveProperty("email");
    expect(result.body.fieldErrors).toHaveProperty("age");
  });

  it("returns 400 for a ValidationError", () => {
    const error = new ValidationError("Invalid input");
    const result = handleApiError(error);

    expect(result.status).toBe(400);
    expect(result.body).toEqual({ error: "Invalid input" });
  });

  it("returns 401 for an UnauthorizedError", () => {
    const error = new UnauthorizedError("Token expired");
    const result = handleApiError(error);

    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: "Token expired" });
  });

  it("returns 403 for a ForbiddenError", () => {
    const error = new ForbiddenError();
    const result = handleApiError(error);

    expect(result.status).toBe(403);
    expect(result.body).toEqual({ error: "Forbidden" });
  });

  it("returns 404 for a NotFoundError", () => {
    const error = new NotFoundError("Account", "acc-123");
    const result = handleApiError(error);

    expect(result.status).toBe(404);
    expect(result.body).toEqual({ error: "Account with id 'acc-123' not found" });
  });

  it("returns 409 for a ConflictError", () => {
    const error = new ConflictError("Email already exists");
    const result = handleApiError(error);

    expect(result.status).toBe(409);
    expect(result.body).toEqual({ error: "Email already exists" });
  });

  it("returns 502 for a TellerError", () => {
    const error = new TellerError("Institution down", "INSTITUTION_DOWN");
    const result = handleApiError(error);

    expect(result.status).toBe(502);
    expect(result.body).toEqual({ error: "Institution down" });
  });

  it("returns 502 for an AiError", () => {
    const error = new AiError("Model timeout");
    const result = handleApiError(error);

    expect(result.status).toBe(502);
    expect(result.body).toEqual({ error: "Model timeout" });
  });

  it("returns 500 for an unknown Error and logs it", () => {
    const error = new Error("something unexpected");
    const result = handleApiError(error);

    expect(result.status).toBe(500);
    expect(result.body).toEqual({ error: "Internal server error" });
    expect(console.error).toHaveBeenCalled();
  });

  it("returns 500 for a non-Error value", () => {
    const result = handleApiError("string error");

    expect(result.status).toBe(500);
    expect(result.body).toEqual({ error: "Internal server error" });
  });
});
