import crypto from "crypto";
import { encrypt, decrypt } from "../encryption";

// 32-byte key expressed as 64 hex characters
const TEST_KEY = crypto.randomBytes(32).toString("hex");

describe("encryption", () => {
  let originalKey: string | undefined;

  beforeAll(() => {
    originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = TEST_KEY;
  });

  afterAll(() => {
    if (originalKey !== undefined) {
      process.env.ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  it("roundtrips encrypt then decrypt back to the original plaintext", () => {
    const plaintext = "my secret access token";
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);

    expect(result).toBe(plaintext);
  });

  it("roundtrips empty string", () => {
    const plaintext = "";
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);

    expect(result).toBe(plaintext);
  });

  it("produces different ciphertexts for different plaintexts", () => {
    const ciphertext1 = encrypt("alpha");
    const ciphertext2 = encrypt("bravo");

    expect(ciphertext1).not.toBe(ciphertext2);
  });

  it("produces different ciphertexts for the same plaintext due to random IV", () => {
    const plaintext = "same text both times";
    const ciphertext1 = encrypt(plaintext);
    const ciphertext2 = encrypt(plaintext);

    expect(ciphertext1).not.toBe(ciphertext2);
  });

  it("produces valid base64 output", () => {
    const ciphertext = encrypt("test data");
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;

    expect(base64Pattern.test(ciphertext)).toBe(true);
  });

  it("handles unicode plaintext correctly", () => {
    const plaintext = "emoji: \u{1F680} and accents: cafe\u0301";
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);

    expect(result).toBe(plaintext);
  });

  it("throws when decrypting tampered ciphertext", () => {
    const ciphertext = encrypt("sensitive data");
    const buffer = Buffer.from(ciphertext, "base64");

    // Flip a byte in the encrypted payload (past the IV and auth tag)
    buffer[buffer.length - 1] ^= 0xff;
    const tampered = buffer.toString("base64");

    expect(() => decrypt(tampered)).toThrow();
  });

  it("throws when ENCRYPTION_KEY is missing", () => {
    const savedKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;

    try {
      expect(() => encrypt("anything")).toThrow(
        "ENCRYPTION_KEY environment variable is not set"
      );
      expect(() => decrypt("anything")).toThrow(
        "ENCRYPTION_KEY environment variable is not set"
      );
    } finally {
      process.env.ENCRYPTION_KEY = savedKey;
    }
  });
});
