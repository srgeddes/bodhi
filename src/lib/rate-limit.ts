import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(cleanupIntervalMs = 60_000) {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, cleanupIntervalMs);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetAt < now) {
      this.store.set(identifier, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count < limit) {
      entry.count++;
      return true;
    }

    logger.warn("Rate limit exceeded", { identifier: identifier.slice(0, 6) + "***", limit });
    return false;
  }
}

const loginLimiter = new RateLimiter();
const registerLimiter = new RateLimiter();
const mfaLimiter = new RateLimiter();
const resendVerificationLimiter = new RateLimiter();

export function checkLoginRateLimit(ip: string): boolean {
  return loginLimiter.check(`login:${ip}`, 5, 15 * 60 * 1000);
}

export function checkRegisterRateLimit(ip: string): boolean {
  return registerLimiter.check(`register:${ip}`, 3, 60 * 60 * 1000);
}

export function checkMfaRateLimit(ip: string): boolean {
  return mfaLimiter.check(`mfa:${ip}`, 5, 5 * 60 * 1000); // 5 attempts per 5 minutes
}

export function checkResendVerificationRateLimit(ip: string): boolean {
  return resendVerificationLimiter.check(`resend-verify:${ip}`, 3, 15 * 60 * 1000); // 3 per 15 minutes
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
