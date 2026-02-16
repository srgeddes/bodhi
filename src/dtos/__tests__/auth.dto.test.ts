import { LoginSchema, RegisterSchema, AuthResponseSchema } from "@/dtos/auth";

describe("Auth DTOs", () => {
  describe("LoginSchema", () => {
    it("parses valid login data", () => {
      const result = LoginSchema.parse({
        email: "user@example.com",
        password: "password123",
      });

      expect(result.email).toBe("user@example.com");
      expect(result.password).toBe("password123");
    });

    it("rejects invalid email", () => {
      expect(() =>
        LoginSchema.parse({ email: "not-an-email", password: "pass" })
      ).toThrow();
    });

    it("rejects empty password", () => {
      expect(() =>
        LoginSchema.parse({ email: "user@example.com", password: "" })
      ).toThrow();
    });
  });

  describe("RegisterSchema", () => {
    it("parses valid registration data", () => {
      const result = RegisterSchema.parse({
        email: "user@example.com",
        password: "Password123",
        name: "Test User",
      });

      expect(result.email).toBe("user@example.com");
      expect(result.password).toBe("Password123");
      expect(result.name).toBe("Test User");
    });

    it("rejects short password", () => {
      expect(() =>
        RegisterSchema.parse({
          email: "user@example.com",
          password: "Sh0rt",
        })
      ).toThrow();
    });

    it("rejects password without uppercase", () => {
      expect(() =>
        RegisterSchema.parse({
          email: "user@example.com",
          password: "password123",
        })
      ).toThrow();
    });

    it("rejects password without number", () => {
      expect(() =>
        RegisterSchema.parse({
          email: "user@example.com",
          password: "Passwordonly",
        })
      ).toThrow();
    });

    it("rejects invalid email", () => {
      expect(() =>
        RegisterSchema.parse({
          email: "not-email",
          password: "Password123",
        })
      ).toThrow();
    });

    it("allows optional name", () => {
      const result = RegisterSchema.parse({
        email: "user@example.com",
        password: "Password123",
      });

      expect(result.name).toBeUndefined();
    });
  });

  describe("AuthResponseSchema", () => {
    it("parses a valid auth response with authenticated status", () => {
      const result = AuthResponseSchema.parse({
        status: "authenticated",
        user: { id: "user-1", email: "user@example.com", name: "Alice", emailVerified: true, mfaEnabled: false },
      });

      expect(result.status).toBe("authenticated");
      expect(result.user?.id).toBe("user-1");
      expect(result.user?.email).toBe("user@example.com");
    });

    it("parses mfa_required response with tempToken", () => {
      const result = AuthResponseSchema.parse({
        status: "mfa_required",
        user: { id: "user-1", email: "user@example.com", name: "Alice", emailVerified: true, mfaEnabled: true },
        tempToken: "jwt.temp.token",
      });

      expect(result.status).toBe("mfa_required");
      expect(result.tempToken).toBe("jwt.temp.token");
    });

    it("parses verification_required response", () => {
      const result = AuthResponseSchema.parse({
        status: "verification_required",
        message: "Check your email",
      });

      expect(result.status).toBe("verification_required");
      expect(result.message).toBe("Check your email");
    });
  });
});
