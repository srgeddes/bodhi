import type { NextRequest } from "next/server";

import { middleware } from "@/middleware";

const mockRedirect = jest.fn().mockReturnValue({ type: "redirect", status: 307 });
const mockNext = jest.fn().mockReturnValue({ type: "next", status: 200 });

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (...args: unknown[]) => mockRedirect(...args),
    next: () => mockNext(),
  },
}));

function mockRequest(pathname: string, hasCookie: boolean): NextRequest {
  return {
    nextUrl: { pathname },
    url: "http://localhost:3000" + pathname,
    cookies: { has: jest.fn().mockReturnValue(hasCookie) },
  } as unknown as NextRequest;
}

describe("Middleware", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockNext.mockClear();
  });

  it("redirects authenticated user on /login to /dashboard", () => {
    const request = mockRequest("/login", true);
    middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/dashboard");
  });

  it("redirects authenticated user on /register to /dashboard", () => {
    const request = mockRequest("/register", true);
    middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/dashboard");
  });

  it("redirects unauthenticated user on /dashboard to /login", () => {
    const request = mockRequest("/dashboard", false);
    middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("allows unauthenticated user on /login", () => {
    const request = mockRequest("/login", false);
    middleware(request);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("allows any user on /", () => {
    const request = mockRequest("/", false);
    middleware(request);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects authenticated user on / to /dashboard", () => {
    const request = mockRequest("/", true);
    middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/dashboard");
  });
});
