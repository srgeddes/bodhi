import { OtpPurpose } from "@/domain/enums";
import { NotFoundError } from "@/domain/errors";
import type { IOtpRepository, IBackupCodeRepository, IUserRepository } from "@/domain/interfaces/repositories";
import {
  generateOtp,
  generateBackupCode,
  hashOtp,
  verifyOtp,
  OTP_EXPIRY_MS,
  BACKUP_CODE_COUNT,
} from "@/lib/otp";
import { EmailService } from "./email.service";

export class MfaService {
  constructor(
    private readonly otpRepository: IOtpRepository,
    private readonly backupCodeRepository: IBackupCodeRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService
  ) {}

  async sendMfaChallenge(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Clean up old MFA login codes
    await this.otpRepository.deleteByUserAndPurpose(userId, OtpPurpose.MfaLogin);

    const code = generateOtp();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.otpRepository.create(userId, codeHash, OtpPurpose.MfaLogin, expiresAt);
    await this.emailService.sendMfaCode(user, code);
  }

  async verifyMfaCode(userId: string, code: string): Promise<boolean> {
    const record = await this.otpRepository.findLatestValid(userId, OtpPurpose.MfaLogin);
    if (!record) return false;

    const isValid = await verifyOtp(code, record.codeHash);
    if (isValid) {
      await this.otpRepository.markUsed(record.id);
    }
    return isValid;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const unusedCodes = await this.backupCodeRepository.findUnusedByUser(userId);

    for (const record of unusedCodes) {
      const isValid = await verifyOtp(code, record.codeHash);
      if (isValid) {
        await this.backupCodeRepository.markUsed(record.id);
        return true;
      }
    }

    return false;
  }

  async enableMfa(userId: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Generate backup codes
    const plaintextCodes: string[] = [];
    const codeHashes: string[] = [];

    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      const code = generateBackupCode();
      plaintextCodes.push(code);
      codeHashes.push(await hashOtp(code));
    }

    // Delete any existing backup codes
    await this.backupCodeRepository.deleteByUser(userId);
    await this.backupCodeRepository.createMany(userId, codeHashes);
    await this.userRepository.updateMfaEnabled(userId, true);

    await this.emailService.sendMfaEnabled(user);
    await this.emailService.sendBackupCodes(user, plaintextCodes);

    return plaintextCodes;
  }

  async disableMfa(userId: string): Promise<void> {
    await this.userRepository.updateMfaEnabled(userId, false);
    await this.backupCodeRepository.deleteByUser(userId);
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const plaintextCodes: string[] = [];
    const codeHashes: string[] = [];

    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      const code = generateBackupCode();
      plaintextCodes.push(code);
      codeHashes.push(await hashOtp(code));
    }

    await this.backupCodeRepository.deleteByUser(userId);
    await this.backupCodeRepository.createMany(userId, codeHashes);

    await this.emailService.sendBackupCodes(user, plaintextCodes);

    return plaintextCodes;
  }
}
