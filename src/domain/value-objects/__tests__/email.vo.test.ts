import { ValidationError } from "@/domain/errors";

import { Email } from "../email.vo";

describe("Email", () => {
  describe("construction", () => {
    it("creates from valid email", () => {
      const email = new Email("user@example.com");
      expect(email.value).toBe("user@example.com");
    });

    it("accepts email with dots in the local part", () => {
      const email = new Email("first.last@example.com");
      expect(email.value).toBe("first.last@example.com");
    });

    it("accepts email with plus tag", () => {
      const email = new Email("user+tag@example.com");
      expect(email.value).toBe("user+tag@example.com");
    });

    it("normalizes to lowercase", () => {
      const email = new Email("USER@Example.COM");
      expect(email.value).toBe("user@example.com");
    });

    it("trims whitespace", () => {
      const email = new Email("  user@example.com  ");
      expect(email.value).toBe("user@example.com");
    });
  });

  describe("validation", () => {
    it("throws on missing @ symbol", () => {
      expect(() => new Email("userexample.com")).toThrow(ValidationError);
    });

    it("throws on missing TLD", () => {
      expect(() => new Email("user@domain")).toThrow(ValidationError);
    });

    it("throws on spaces in address", () => {
      expect(() => new Email("user @example.com")).toThrow(ValidationError);
    });

    it("throws on empty string", () => {
      expect(() => new Email("")).toThrow(ValidationError);
    });

    it("throws on whitespace-only string", () => {
      expect(() => new Email("   ")).toThrow(ValidationError);
    });
  });

  describe("comparison", () => {
    it("equals returns true for same email", () => {
      const a = new Email("test@example.com");
      const b = new Email("test@example.com");
      expect(a.equals(b)).toBe(true);
    });

    it("equals returns true for case-different inputs that normalize the same", () => {
      const a = new Email("Test@Example.COM");
      const b = new Email("test@example.com");
      expect(a.equals(b)).toBe(true);
    });

    it("equals returns false for different emails", () => {
      const a = new Email("a@example.com");
      const b = new Email("b@example.com");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("formatting", () => {
    it("toString returns the normalized email value", () => {
      const email = new Email("User@Example.com");
      expect(email.toString()).toBe("user@example.com");
    });
  });
});
