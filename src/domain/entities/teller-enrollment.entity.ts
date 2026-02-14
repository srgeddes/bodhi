import { BaseEntity } from "./base.entity";
import { EnrollmentStatus } from "@/domain/enums";

export class TellerEnrollment extends BaseEntity {
  userId: string;
  accessToken: string; // stored encrypted
  enrollmentId: string;
  institutionName: string | null;
  status: EnrollmentStatus;
  lastSyncedDate: Date | null;
  lastSyncedAt: Date | null;

  constructor(params: {
    id?: string;
    userId: string;
    accessToken: string;
    enrollmentId: string;
    institutionName?: string | null;
    status?: EnrollmentStatus;
    lastSyncedDate?: Date | null;
    lastSyncedAt?: Date | null;
  }) {
    super(params.id);
    this.userId = params.userId;
    this.accessToken = params.accessToken;
    this.enrollmentId = params.enrollmentId;
    this.institutionName = params.institutionName ?? null;
    this.status = params.status ?? EnrollmentStatus.Active;
    this.lastSyncedDate = params.lastSyncedDate ?? null;
    this.lastSyncedAt = params.lastSyncedAt ?? null;
  }

  isActive(): boolean {
    return this.status === EnrollmentStatus.Active;
  }

  needsReauth(): boolean {
    return this.status === EnrollmentStatus.Disconnected;
  }

  updateLastSyncedDate(date: Date): void {
    this.lastSyncedDate = date;
    this.updatedAt = new Date();
  }

  markSynced(): void {
    this.lastSyncedAt = new Date();
    this.updatedAt = new Date();
  }
}
