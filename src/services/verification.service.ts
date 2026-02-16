import { OtpPurpose } from "@/domain/enums";
import { NotFoundError } from "@/domain/errors";
import type { IOtpRepository } from "@/domain/interfaces/repositories";
import type { IUserRepository } from "@/domain/interfaces/repositories";
import { prisma } from "@/lib/db";
import { generateVerificationToken, hashToken, VERIFICATION_TOKEN_EXPIRY_MS } from "@/lib/otp";
import { EmailService } from "./email.service";

export class VerificationService {
  constructor(
    private readonly otpRepository: IOtpRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService
  ) {}

  async sendVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Clean up any existing verification tokens
    await this.otpRepository.deleteByUserAndPurpose(userId, OtpPurpose.EmailVerification);

    const token = generateVerificationToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

    await this.otpRepository.create(userId, tokenHash, OtpPurpose.EmailVerification, expiresAt);
    await this.emailService.sendVerificationEmail(user, token);
  }

  async verifyEmail(token: string): Promise<string> {
    const tokenHash = hashToken(token);

    // SHA-256 hash is deterministic, so we can query by exact match
    const record = await prisma.otpCode.findFirst({
      where: {
        codeHash: tokenHash,
        purpose: OtpPurpose.EmailVerification,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new NotFoundError("Invalid or expired verification link");
    }

    await this.otpRepository.markUsed(record.id);
    await this.userRepository.updateEmailVerified(record.userId, true);

    return record.userId;
  }

  async resendVerification(userId: string): Promise<void> {
    await this.sendVerification(userId);
  }
}
