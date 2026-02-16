import { Resend } from "resend";
import { logger } from "./logger";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "Trellis <noreply@trellis.finance>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      logger.error("Failed to send email", { to, subject, error: error.message });
      throw new Error(`Email delivery failed: ${error.message}`);
    }

    logger.info("Email sent", { to, subject });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Email delivery failed")) {
      throw err;
    }
    logger.error("Email send error", { to, subject, error: err instanceof Error ? err.message : "Unknown" });
    throw new Error("Failed to send email");
  }
}

export function verificationEmailHtml(name: string | null, verifyUrl: string): string {
  const greeting = name ? `Hi ${name}` : "Hi there";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Verify your email</h2>
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">${greeting}, thanks for signing up for Trellis. Please verify your email address by clicking the button below.</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin: 24px 0;">Verify Email</a>
      <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
}

export function mfaCodeEmailHtml(name: string | null, code: string): string {
  const greeting = name ? `Hi ${name}` : "Hi there";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Your sign-in code</h2>
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">${greeting}, use this code to complete your sign-in:</p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1a1a1a;">${code}</span>
      </div>
      <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5;">This code expires in 5 minutes. If you didn't try to sign in, someone may be trying to access your account. Please change your password.</p>
    </div>
  `;
}

export function mfaEnabledEmailHtml(name: string | null): string {
  const greeting = name ? `Hi ${name}` : "Hi there";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Two-factor authentication enabled</h2>
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">${greeting}, two-factor authentication has been enabled on your Trellis account. You will now need to enter a verification code sent to your email each time you sign in.</p>
      <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5;">If you didn't make this change, please secure your account immediately.</p>
    </div>
  `;
}

export function backupCodesEmailHtml(name: string | null, codes: string[]): string {
  const greeting = name ? `Hi ${name}` : "Hi there";
  const codeList = codes.map((c) => `<li style="font-family: monospace; font-size: 14px; padding: 4px 0;">${c}</li>`).join("");
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Your backup codes</h2>
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">${greeting}, here are your backup codes for Trellis. Store them somewhere safe — each code can only be used once.</p>
      <ul style="background: #f5f5f5; border-radius: 8px; padding: 16px 16px 16px 32px; margin: 24px 0; list-style: none;">
        ${codeList}
      </ul>
      <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5;">If you lose access to your email, you can use one of these codes to sign in.</p>
    </div>
  `;
}
