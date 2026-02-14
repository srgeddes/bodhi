import { prisma } from "@/lib/db";
import { BaseRepository } from "../base.repository";
import { TellerEnrollment } from "@/domain/entities";
import { ITellerEnrollmentRepository } from "@/domain/interfaces/repositories";
import { TellerEnrollmentMapper } from "@/mappers";

export class PrismaTellerEnrollmentRepository extends BaseRepository<TellerEnrollment> implements ITellerEnrollmentRepository {
  protected get delegate() {
    return prisma.tellerEnrollment;
  }

  protected toEntity(raw: unknown): TellerEnrollment {
    return TellerEnrollmentMapper.toDomain(raw as Record<string, unknown>);
  }

  protected toCreateData(data: Partial<TellerEnrollment>): Record<string, unknown> {
    return TellerEnrollmentMapper.toPersistence(data as TellerEnrollment);
  }

  protected toUpdateData(data: Partial<TellerEnrollment>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.status !== undefined) result.status = data.status;
    if (data.lastSyncedAt !== undefined) result.lastSyncedAt = data.lastSyncedAt;
    if (data.lastSyncedDate !== undefined) result.lastSyncedDate = data.lastSyncedDate;
    if (data.accessToken !== undefined) result.accessToken = data.accessToken;
    return result;
  }

  async findByEnrollmentId(enrollmentId: string): Promise<TellerEnrollment | null> {
    const raw = await prisma.tellerEnrollment.findUnique({ where: { enrollmentId } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByUserId(userId: string): Promise<TellerEnrollment[]> {
    const raw = await prisma.tellerEnrollment.findMany({ where: { userId } });
    return raw.map((r) => this.toEntity(r));
  }

  async findActiveByUserId(userId: string): Promise<TellerEnrollment[]> {
    const raw = await prisma.tellerEnrollment.findMany({
      where: { userId, status: "ACTIVE" },
    });
    return raw.map((r) => this.toEntity(r));
  }

  async findAllActive(): Promise<TellerEnrollment[]> {
    const raw = await prisma.tellerEnrollment.findMany({
      where: { status: "ACTIVE" },
    });
    return raw.map((r) => this.toEntity(r));
  }

  async updateLastSyncedDate(id: string, date: Date): Promise<void> {
    await prisma.tellerEnrollment.update({
      where: { id },
      data: { lastSyncedDate: date, lastSyncedAt: new Date() },
    });
  }
}
