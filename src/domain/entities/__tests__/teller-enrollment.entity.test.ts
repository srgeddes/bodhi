import { TellerEnrollment } from "../teller-enrollment.entity";
import { EnrollmentStatus } from "@/domain/enums";

function createTellerEnrollment(
  overrides: Partial<ConstructorParameters<typeof TellerEnrollment>[0]> = {}
): TellerEnrollment {
  return new TellerEnrollment({
    userId: "user-1",
    accessToken: "access-token-abc123",
    enrollmentId: "enrollment-sandbox-xyz",
    ...overrides,
  });
}

describe("TellerEnrollment", () => {
  describe("construction defaults", () => {
    it("defaults status to Active", () => {
      const enrollment = createTellerEnrollment();
      expect(enrollment.status).toBe(EnrollmentStatus.Active);
    });

    it("defaults optional fields to null", () => {
      const enrollment = createTellerEnrollment();
      expect(enrollment.institutionName).toBeNull();
      expect(enrollment.lastSyncedDate).toBeNull();
      expect(enrollment.lastSyncedAt).toBeNull();
    });
  });

  describe("isActive", () => {
    it("returns true for Active status", () => {
      const enrollment = createTellerEnrollment({ status: EnrollmentStatus.Active });
      expect(enrollment.isActive()).toBe(true);
    });

    it("returns false for Degraded status", () => {
      const enrollment = createTellerEnrollment({ status: EnrollmentStatus.Degraded });
      expect(enrollment.isActive()).toBe(false);
    });

    it("returns false for Disconnected status", () => {
      const enrollment = createTellerEnrollment({ status: EnrollmentStatus.Disconnected });
      expect(enrollment.isActive()).toBe(false);
    });
  });

  describe("needsReauth", () => {
    it("returns true for Disconnected", () => {
      const enrollment = createTellerEnrollment({ status: EnrollmentStatus.Disconnected });
      expect(enrollment.needsReauth()).toBe(true);
    });

    it("returns false for Active", () => {
      const enrollment = createTellerEnrollment({ status: EnrollmentStatus.Active });
      expect(enrollment.needsReauth()).toBe(false);
    });

    it("returns false for Degraded", () => {
      const enrollment = createTellerEnrollment({ status: EnrollmentStatus.Degraded });
      expect(enrollment.needsReauth()).toBe(false);
    });
  });

  describe("updateLastSyncedDate", () => {
    it("sets lastSyncedDate and updates updatedAt", () => {
      const enrollment = createTellerEnrollment();
      const originalUpdatedAt = enrollment.updatedAt;
      const syncDate = new Date("2025-06-01");

      enrollment.updateLastSyncedDate(syncDate);

      expect(enrollment.lastSyncedDate).toEqual(syncDate);
      expect(enrollment.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe("markSynced", () => {
    it("sets lastSyncedAt and updates updatedAt", () => {
      const enrollment = createTellerEnrollment();
      const before = new Date();

      expect(enrollment.lastSyncedAt).toBeNull();

      enrollment.markSynced();

      const after = new Date();

      expect(enrollment.lastSyncedAt).not.toBeNull();
      expect(enrollment.lastSyncedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(enrollment.lastSyncedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(enrollment.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
