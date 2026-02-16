import { User } from "@/domain/entities";
import {
  sendEmail,
  verificationEmailHtml,
  mfaCodeEmailHtml,
  mfaEnabledEmailHtml,
  backupCodesEmailHtml,
} from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export class EmailService {
  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const verifyUrl = `${APP_URL}/verify-email/${token}`;
    await sendEmail({
      to: user.email.value,
      subject: "Verify your email — Trellis",
      html: verificationEmailHtml(user.name, verifyUrl),
    });
  }

  async sendMfaCode(user: User, code: string): Promise<void> {
    await sendEmail({
      to: user.email.value,
      subject: "Your sign-in code — Trellis",
      html: mfaCodeEmailHtml(user.name, code),
    });
  }

  async sendMfaEnabled(user: User): Promise<void> {
    await sendEmail({
      to: user.email.value,
      subject: "Two-factor authentication enabled — Trellis",
      html: mfaEnabledEmailHtml(user.name),
    });
  }

  async sendBackupCodes(user: User, codes: string[]): Promise<void> {
    await sendEmail({
      to: user.email.value,
      subject: "Your backup codes — Trellis",
      html: backupCodesEmailHtml(user.name, codes),
    });
  }
}
