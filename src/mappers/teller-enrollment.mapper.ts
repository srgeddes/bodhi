import { BaseMapper } from "./base.mapper";
import { TellerEnrollment } from "@/domain/entities";
import { EnrollmentStatus } from "@/domain/enums";

interface TellerEnrollmentResponseDto {
  id: string;
  institutionName: string | null;
  status: string;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

class TellerEnrollmentMapperImpl extends BaseMapper<TellerEnrollment, TellerEnrollmentResponseDto> {
  toDto(entity: TellerEnrollment): TellerEnrollmentResponseDto {
    return {
      id: entity.id,
      institutionName: entity.institutionName,
      status: entity.status,
      lastSyncedAt: entity.lastSyncedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toDomain(raw: Record<string, unknown>): TellerEnrollment {
    const enrollment = new TellerEnrollment({
      id: raw.id as string,
      userId: raw.userId as string,
      accessToken: raw.accessToken as string,
      enrollmentId: raw.enrollmentId as string,
      institutionName: (raw.institutionName as string) ?? null,
      status: raw.status as EnrollmentStatus,
      lastSyncedDate: raw.lastSyncedDate ? new Date(raw.lastSyncedDate as string) : null,
      lastSyncedAt: raw.lastSyncedAt ? new Date(raw.lastSyncedAt as string) : null,
    });
    Object.assign(enrollment, {
      createdAt: new Date(raw.createdAt as string),
      updatedAt: new Date(raw.updatedAt as string),
    });
    return enrollment;
  }

  toPersistence(entity: TellerEnrollment): Record<string, unknown> {
    return {
      id: entity.id,
      userId: entity.userId,
      accessToken: entity.accessToken,
      enrollmentId: entity.enrollmentId,
      institutionName: entity.institutionName,
      status: entity.status,
      lastSyncedDate: entity.lastSyncedDate,
      lastSyncedAt: entity.lastSyncedAt,
    };
  }
}

export const TellerEnrollmentMapper = new TellerEnrollmentMapperImpl();
