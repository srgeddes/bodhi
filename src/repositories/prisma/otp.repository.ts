import { prisma } from "@/lib/db";
import { OtpPurpose } from "@/domain/enums";
import type { IOtpRepository, OtpRecord } from "@/domain/interfaces/repositories/otp.repository";

export class PrismaOtpRepository implements IOtpRepository {
  async create(
    userId: string,
    codeHash: string,
    purpose: OtpPurpose,
    expiresAt: Date
  ): Promise<OtpRecord> {
    const record = await prisma.otpCode.create({
      data: { userId, codeHash, purpose, expiresAt },
    });
    return this.toRecord(record);
  }

  async findLatestValid(userId: string, purpose: OtpPurpose): Promise<OtpRecord | null> {
    const record = await prisma.otpCode.findFirst({
      where: {
        userId,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    return record ? this.toRecord(record) : null;
  }

  async markUsed(id: string): Promise<void> {
    await prisma.otpCode.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.otpCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  async deleteByUserAndPurpose(userId: string, purpose: OtpPurpose): Promise<void> {
    await prisma.otpCode.deleteMany({
      where: { userId, purpose },
    });
  }

  private toRecord(raw: {
    id: string;
    userId: string;
    codeHash: string;
    purpose: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  }): OtpRecord {
    return {
      id: raw.id,
      userId: raw.userId,
      codeHash: raw.codeHash,
      purpose: raw.purpose as OtpPurpose,
      expiresAt: raw.expiresAt,
      used: raw.used,
      createdAt: raw.createdAt,
    };
  }
}
