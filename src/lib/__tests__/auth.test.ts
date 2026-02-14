import jwt from "jsonwebtoken";
import { signToken, verifyToken, extractTokenFromRequest } from "../auth";
import type { NextRequest } from "next/server";
import { JWT_COOKIE_NAME } from "@/config/constants";

const TEST_SECRET = "test-secret-key-for-testing";

function mockRequest(options: {
  cookie?: string;
  authHeader?: string;
}): NextRequest {
  const cookies = {
    get: jest.fn((name: string) =>
      name === JWT_COOKIE_NAME && options.cookie
        ? { value: options.cookie }
        : undefined
    ),
  };
  const headers = {
    get: jest.fn((name: string) =>
      name === "authorization" ? (options.authHeader ?? null) : null
    ),
  };
  return { cookies, headers } as unknown as NextRequest;
}

describe("auth", () => {
  let originalSecret: string | undefined;

  beforeAll(() => {
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    if (originalSecret !== undefined) {
      process.env.JWT_SECRET = originalSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("signToken", () => {
    it("returns a string", () => {
      const token = signToken("user-123");

      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("produces a token with three dot-separated segments", () => {
      const token = signToken("user-456");
      const segments = token.split(".");

      expect(segments).toHaveLength(3);
    });
  });

  describe("verifyToken", () => {
    it("roundtrips with signToken and returns the same userId", () => {
      const userId = "user-abc-789";
      const token = signToken(userId);
      const payload = verifyToken(token);

      expect(payload.userId).toBe(userId);
    });

    it("throws when given an invalid token", () => {
      expect(() => verifyToken("not.a.valid.token")).toThrow();
    });

    it("throws when the token was signed with a different secret", () => {
      const token = jwt.sign({ userId: "user-1" }, "wrong-secret", {
        expiresIn: 3600,
      });

      expect(() => verifyToken(token)).toThrow();
    });

    it("throws when the token is expired", () => {
      const token = jwt.sign({ userId: "user-1" }, TEST_SECRET, {
        expiresIn: -10,
      });

      expect(() => verifyToken(token)).toThrow();
    });
  });

  describe("extractTokenFromRequest", () => {
    it("returns the token from the auth cookie", () => {
      const request = mockRequest({ cookie: "my-cookie-token" });
      const token = extractTokenFromRequest(request);

      expect(token).toBe("my-cookie-token");
    });

    it("returns the token from the Bearer authorization header", () => {
      const request = mockRequest({ authHeader: "Bearer my-bearer-token" });
      const token = extractTokenFromRequest(request);

      expect(token).toBe("my-bearer-token");
    });

    it("prefers the cookie over the authorization header", () => {
      const request = mockRequest({
        cookie: "cookie-token",
        authHeader: "Bearer header-token",
      });
      const token = extractTokenFromRequest(request);

      expect(token).toBe("cookie-token");
    });

    it("returns null when neither cookie nor header is present", () => {
      const request = mockRequest({});
      const token = extractTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it("returns null when authorization header is not a Bearer token", () => {
      const request = mockRequest({ authHeader: "Basic abc123" });
      const token = extractTokenFromRequest(request);

      expect(token).toBeNull();
    });
  });
});
