import bcrypt from "bcryptjs";
import { UserService } from "../user.service";
import { ConflictError, UnauthorizedError } from "@/domain/errors";
import { User } from "@/domain/entities";
import { Email } from "@/domain/value-objects";
import { IUserRepository } from "@/domain/interfaces/repositories";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  signToken: jest.fn().mockReturnValue("mock_token"),
  signMfaTempToken: jest.fn().mockReturnValue("mock_mfa_temp_token"),
}));

jest.mock("@/config/constants", () => ({
  BCRYPT_ROUNDS: 10,
}));

function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    updateEmailVerified: jest.fn(),
    updateMfaEnabled: jest.fn(),
  };
}

function createTestUser(overrides?: Partial<User>): User {
  return new User({
    id: "user-1",
    email: new Email("test@example.com"),
    passwordHash: "hashed_password",
    name: "Test User",
    emailVerified: true,
    ...overrides,
  });
}

describe("UserService", () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = createMockUserRepository();
    service = new UserService(userRepository);
  });

  describe("register", () => {
    const registerDto = {
      email: "new@example.com",
      password: "secure_password_123",
      name: "New User",
    };

    it("creates a user and returns verification_required status", async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      const createdUser = createTestUser({
        email: new Email("new@example.com"),
        name: "New User",
        emailVerified: false,
      });
      userRepository.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(result.user).toEqual(createdUser);
      expect(result.status).toBe("verification_required");
      expect(result.token).toBeUndefined();
      expect(userRepository.existsByEmail).toHaveBeenCalledWith("new@example.com");
      expect(userRepository.create).toHaveBeenCalled();
    });

    it("throws ConflictError when email already exists", async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictError);
      await expect(service.register(registerDto)).rejects.toThrow(
        "Unable to create account with this email"
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("hashes the password instead of storing plaintext", async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(createTestUser());

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith("secure_password_123", 10);
      const createArg = userRepository.create.mock.calls[0][0] as User;
      expect(createArg.passwordHash).toBe("hashed_password");
      expect(createArg.passwordHash).not.toBe("secure_password_123");
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "correct_password",
    };

    it("returns authenticated status with token on valid credentials", async () => {
      const user = createTestUser({ emailVerified: true });
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user).toEqual(user);
      expect(result.status).toBe("authenticated");
      expect(result.token).toBe("mock_token");
      expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(bcrypt.compare).toHaveBeenCalledWith("correct_password", "hashed_password");
    });

    it("returns verification_required when email not verified", async () => {
      const user = createTestUser({ emailVerified: false });
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.status).toBe("verification_required");
      expect(result.token).toBeUndefined();
    });

    it("returns mfa_required when MFA is enabled", async () => {
      const user = createTestUser({ emailVerified: true, mfaEnabled: true });
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.status).toBe("mfa_required");
      expect(result.tempToken).toBe("mock_mfa_temp_token");
      expect(result.token).toBeUndefined();
    });

    it("throws UnauthorizedError when email is not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedError);
      await expect(service.login(loginDto)).rejects.toThrow("Invalid email or password");
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("throws UnauthorizedError when password is invalid", async () => {
      const user = createTestUser();
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedError);
      await expect(service.login(loginDto)).rejects.toThrow("Invalid email or password");
    });
  });
});
