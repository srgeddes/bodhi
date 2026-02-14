import { TellerConnectSuccessSchema } from "@/dtos/teller";

describe("Teller DTOs", () => {
  describe("TellerConnectSuccessSchema", () => {
    it("parses valid data", () => {
      const result = TellerConnectSuccessSchema.parse({
        accessToken: "access-token-abc",
        enrollmentId: "enrollment-123",
      });

      expect(result.accessToken).toBe("access-token-abc");
      expect(result.enrollmentId).toBe("enrollment-123");
    });

    it("rejects missing accessToken", () => {
      expect(() =>
        TellerConnectSuccessSchema.parse({ enrollmentId: "enrollment-123" })
      ).toThrow();
    });

    it("rejects empty accessToken", () => {
      expect(() =>
        TellerConnectSuccessSchema.parse({ accessToken: "", enrollmentId: "enrollment-123" })
      ).toThrow();
    });

    it("rejects missing enrollmentId", () => {
      expect(() =>
        TellerConnectSuccessSchema.parse({ accessToken: "token" })
      ).toThrow();
    });

    it("rejects empty enrollmentId", () => {
      expect(() =>
        TellerConnectSuccessSchema.parse({ accessToken: "token", enrollmentId: "" })
      ).toThrow();
    });

    it("accepts optional institutionName", () => {
      const result = TellerConnectSuccessSchema.parse({
        accessToken: "token",
        enrollmentId: "enrollment-123",
        institutionName: "Chase",
      });

      expect(result.institutionName).toBe("Chase");
    });
  });
});
