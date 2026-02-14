import { TellerEnrollmentMapper } from "@/mappers/teller-enrollment.mapper";
import { TellerEnrollment } from "@/domain/entities";
import { EnrollmentStatus } from "@/domain/enums";

function createTellerEnrollment(
  overrides: Partial<{
    institutionName: string | null;
    lastSyncedAt: Date | null;
  }> = {}
): TellerEnrollment {
  return new TellerEnrollment({
    id: "enrollment-1",
    userId: "user-1",
    accessToken: "secret-token",
    enrollmentId: "teller-enrollment-123",
    institutionName:
      "institutionName" in overrides ? overrides.institutionName : "Chase",
    status: EnrollmentStatus.Active,
    lastSyncedAt:
      "lastSyncedAt" in overrides
        ? overrides.lastSyncedAt
        : new Date("2024-06-01T00:00:00.000Z"),
  });
}

describe("TellerEnrollmentMapper", () => {
  describe("toDto", () => {
    it("does not include accessToken", () => {
      const dto = TellerEnrollmentMapper.toDto(createTellerEnrollment());

      expect(dto).not.toHaveProperty("accessToken");
      expect(dto.id).toBe("enrollment-1");
      expect(dto.institutionName).toBe("Chase");
    });

    it("formats dates as ISO strings", () => {
      const enrollment = createTellerEnrollment();
      const dto = TellerEnrollmentMapper.toDto(enrollment);

      expect(dto.createdAt).toBe(enrollment.createdAt.toISOString());
      expect(dto.updatedAt).toBe(enrollment.updatedAt.toISOString());
      expect(dto.lastSyncedAt).toBe("2024-06-01T00:00:00.000Z");
    });

    it("includes institution details and status", () => {
      const dto = TellerEnrollmentMapper.toDto(createTellerEnrollment());

      expect(dto.institutionName).toBe("Chase");
      expect(dto.status).toBe(EnrollmentStatus.Active);
    });
  });

  describe("toDomain", () => {
    it("creates TellerEnrollment entity", () => {
      const raw = {
        id: "enrollment-1",
        userId: "user-1",
        accessToken: "encrypted-token",
        enrollmentId: "teller-123",
        institutionName: "Chase",
        status: EnrollmentStatus.Active,
        lastSyncedDate: null,
        lastSyncedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const enrollment = TellerEnrollmentMapper.toDomain(raw);

      expect(enrollment).toBeInstanceOf(TellerEnrollment);
      expect(enrollment.enrollmentId).toBe("teller-123");
      expect(enrollment.status).toBe(EnrollmentStatus.Active);
      expect(enrollment.institutionName).toBe("Chase");
    });
  });

  describe("toPersistence", () => {
    it("includes the accessToken for storage", () => {
      const persistence = TellerEnrollmentMapper.toPersistence(createTellerEnrollment());

      expect(persistence.accessToken).toBe("secret-token");
      expect(persistence.id).toBe("enrollment-1");
      expect(persistence.userId).toBe("user-1");
    });
  });
});
