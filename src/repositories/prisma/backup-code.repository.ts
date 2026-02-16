import { prisma } from "@/lib/db";
import type { IBackupCodeRepository, BackupCodeRecord } from "@/domain/interfaces/repositories/backup-code.repository";

export class PrismaBackupCodeRepository implements IBackupCodeRepository {
  async createMany(userId: string, codeHashes: string[]): Promise<void> {
    await prisma.backupCode.createMany({
      data: codeHashes.map((codeHash) => ({ userId, codeHash })),
    });
  }

  async findUnusedByUser(userId: string): Promise<BackupCodeRecord[]> {
    const records = await prisma.backupCode.findMany({
      where: { userId, used: false },
      orderBy: { createdAt: "asc" },
    });
    return records.map(this.toRecord);
  }

  async markUsed(id: string): Promise<void> {
    await prisma.backupCode.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteByUser(userId: string): Promise<void> {
    await prisma.backupCode.deleteMany({
      where: { userId },
    });
  }

  private toRecord(raw: {
    id: string;
    userId: string;
    codeHash: string;
    used: boolean;
    createdAt: Date;
  }): BackupCodeRecord {
    return {
      id: raw.id,
      userId: raw.userId,
      codeHash: raw.codeHash,
      used: raw.used,
      createdAt: raw.createdAt,
    };
  }
}
