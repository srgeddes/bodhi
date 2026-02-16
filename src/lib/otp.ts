import crypto from "crypto";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/config/constants";

export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const BACKUP_CODE_COUNT = 10;

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateBackupCode(): string {
  return crypto.randomBytes(4).toString("hex"); // 8-char hex code
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
