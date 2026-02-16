import bcrypt from "bcryptjs";
import { BaseService } from "./base.service";
import { User } from "@/domain/entities";
import { ConflictError, UnauthorizedError } from "@/domain/errors";
import { IUserRepository } from "@/domain/interfaces/repositories";
import { signToken, signMfaTempToken } from "@/lib/auth";
import { BCRYPT_ROUNDS } from "@/config/constants";
import { RegisterDto, LoginDto } from "@/dtos/auth";
import type { VerificationService } from "./verification.service";
import type { MfaService } from "./mfa.service";

type AuthStatus = "authenticated" | "verification_required" | "mfa_required";

export interface AuthResult {
  user: User;
  status: AuthStatus;
  token?: string;
  tempToken?: string;
}

export class UserService extends BaseService<User> {
  protected readonly entityName = "User";
  private verificationService?: VerificationService;
  private mfaService?: MfaService;

  constructor(private readonly userRepository: IUserRepository) {
    super(userRepository);
  }

  setVerificationService(service: VerificationService): void {
    this.verificationService = service;
  }

  setMfaService(service: MfaService): void {
    this.mfaService = service;
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictError("Unable to create account with this email");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = User.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const created = await this.repository.create(user);

    // Send verification email
    if (this.verificationService) {
      await this.verificationService.sendVerification(created.id);
    }

    return { user: created, status: "verification_required" };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Demo users skip verification and MFA
    if (user.isDemo) {
      const token = signToken(user.id);
      return { user, status: "authenticated", token };
    }

    // Block unverified users
    if (!user.emailVerified) {
      return { user, status: "verification_required" };
    }

    // MFA challenge
    if (user.mfaEnabled) {
      if (this.mfaService) {
        await this.mfaService.sendMfaChallenge(user.id);
      }
      const tempToken = signMfaTempToken(user.id);
      return { user, status: "mfa_required", tempToken };
    }

    const token = signToken(user.id);
    return { user, status: "authenticated", token };
  }
}
