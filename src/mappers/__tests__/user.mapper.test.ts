import { UserMapper } from "@/mappers/user.mapper";
import { User } from "@/domain/entities";
import { Email } from "@/domain/value-objects";

function createUser(
  overrides: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    name: string | null;
  }> = {}
): User {
  return new User({
    id: overrides.id ?? "user-1",
    email: new Email(overrides.email ?? "test@example.com"),
    passwordHash: overrides.passwordHash ?? "hashed-password",
    name: overrides.name ?? "Test User",
  });
}

describe("UserMapper", () => {
  describe("toDto", () => {
    it("converts email VO to string", () => {
      const dto = UserMapper.toDto(createUser());

      expect(dto.email).toBe("test@example.com");
    });

    it("formats dates as ISO strings", () => {
      const user = createUser();
      const dto = UserMapper.toDto(user);

      expect(dto.createdAt).toBe(user.createdAt.toISOString());
      expect(dto.updatedAt).toBe(user.updatedAt.toISOString());
    });

    it("includes id and name", () => {
      const dto = UserMapper.toDto(createUser());

      expect(dto.id).toBe("user-1");
      expect(dto.name).toBe("Test User");
    });
  });

  describe("toDomain", () => {
    it("creates User with Email VO", () => {
      const raw = {
        id: "user-1",
        email: "test@example.com",
        passwordHash: "hashed",
        name: "Test",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-06-15T12:00:00.000Z",
      };

      const user = UserMapper.toDomain(raw);

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.value).toBe("test@example.com");
      expect(user.id).toBe("user-1");
    });
  });

  describe("toPersistence", () => {
    it("extracts email value", () => {
      const persistence = UserMapper.toPersistence(createUser());

      expect(persistence.email).toBe("test@example.com");
      expect(persistence.passwordHash).toBe("hashed-password");
      expect(persistence.id).toBe("user-1");
    });
  });

  describe("toDtoList", () => {
    it("maps array of users", () => {
      const users = [
        createUser({ id: "u1", email: "a@example.com" }),
        createUser({ id: "u2", email: "b@example.com" }),
      ];

      const dtos = UserMapper.toDtoList(users);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe("u1");
      expect(dtos[1].id).toBe("u2");
    });
  });
});
