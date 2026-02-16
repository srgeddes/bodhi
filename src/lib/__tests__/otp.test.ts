import {
  generateOtp,
  generateVerificationToken,
  generateBackupCode,
  hashOtp,
  verifyOtp,
  hashToken,
} from "../otp";

jest.mock("@/config/constants", () => ({
  BCRYPT_ROUNDS: 4, // Fast rounds for tests
}));

describe("OTP Utilities", () => {
  describe("generateOtp", () => {
    it("generates a 6-digit numeric string", () => {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it("generates different codes on each call", () => {
      const codes = new Set(Array.from({ length: 10 }, () => generateOtp()));
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe("generateVerificationToken", () => {
    it("generates a 64-char hex string", () => {
      const token = generateVerificationToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("generateBackupCode", () => {
    it("generates an 8-char hex string", () => {
      const code = generateBackupCode();
      expect(code).toMatch(/^[0-9a-f]{8}$/);
    });
  });

  describe("hashOtp / verifyOtp", () => {
    it("verifies a correct OTP", async () => {
      const code = "123456";
      const hash = await hashOtp(code);
      const isValid = await verifyOtp(code, hash);
      expect(isValid).toBe(true);
    });

    it("rejects an incorrect OTP", async () => {
      const hash = await hashOtp("123456");
      const isValid = await verifyOtp("654321", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("hashToken", () => {
    it("produces a deterministic SHA-256 hash", () => {
      const token = "test-token-value";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it("produces different hashes for different tokens", () => {
      const hash1 = hashToken("token-a");
      const hash2 = hashToken("token-b");
      expect(hash1).not.toBe(hash2);
    });
  });
});
