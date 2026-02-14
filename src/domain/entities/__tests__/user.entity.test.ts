import { User } from "../user.entity";
import { Email } from "@/domain/value-objects";

describe("User", () => {
  describe("create static method", () => {
    it("creates a user with Email value object from a string", () => {
      const user = User.create({
        email: "test@example.com",
        passwordHash: "hashed-pw",
      });

      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.value).toBe("test@example.com");
    });

    it("sets the passwordHash from the provided value", () => {
      const user = User.create({
        email: "test@example.com",
        passwordHash: "hashed-pw-123",
      });

      expect(user.passwordHash).toBe("hashed-pw-123");
    });

    it("sets the name when provided", () => {
      const user = User.create({
        email: "test@example.com",
        passwordHash: "hashed-pw",
        name: "Jane Doe",
      });

      expect(user.name).toBe("Jane Doe");
    });

    it("defaults name to null when not provided", () => {
      const user = User.create({
        email: "test@example.com",
        passwordHash: "hash",
      });

      expect(user.name).toBeNull();
    });
  });

  describe("constructor", () => {
    it("accepts Email value object directly", () => {
      const email = new Email("direct@example.com");
      const user = new User({
        email,
        passwordHash: "hash",
      });

      expect(user.email.value).toBe("direct@example.com");
    });

    it("auto-generates an id", () => {
      const user = User.create({
        email: "test@example.com",
        passwordHash: "hash",
      });

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe("string");
      expect(user.id.length).toBeGreaterThan(0);
    });
  });
});
