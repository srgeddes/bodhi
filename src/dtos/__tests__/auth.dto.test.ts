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
        password: "password123",
        name: "Test User",
      });

      expect(result.email).toBe("user@example.com");
      expect(result.password).toBe("password123");
      expect(result.name).toBe("Test User");
    });

    it("rejects short password", () => {
      expect(() =>
        RegisterSchema.parse({
          email: "user@example.com",
          password: "short",
        })
      ).toThrow();
    });

    it("rejects invalid email", () => {
      expect(() =>
        RegisterSchema.parse({
          email: "not-email",
          password: "password123",
        })
      ).toThrow();
    });

    it("allows optional name", () => {
      const result = RegisterSchema.parse({
        email: "user@example.com",
        password: "password123",
      });

      expect(result.name).toBeUndefined();
    });
  });

  describe("AuthResponseSchema", () => {
    it("parses a valid auth response", () => {
      const result = AuthResponseSchema.parse({
        user: { id: "user-1", email: "user@example.com", name: "Alice" },
        token: "jwt-token-value",
      });

      expect(result.user.id).toBe("user-1");
      expect(result.user.email).toBe("user@example.com");
      expect(result.token).toBe("jwt-token-value");
    });
  });
});
