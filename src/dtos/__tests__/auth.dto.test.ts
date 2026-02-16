import { LoginSchema, RegisterSchema } from "@/dtos/auth";

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
});
