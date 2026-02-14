import { prisma } from "@/lib/db";
import { BaseRepository } from "../base.repository";
import { Account } from "@/domain/entities";
import { IAccountRepository } from "@/domain/interfaces/repositories";
import { AccountMapper } from "@/mappers";

export class PrismaAccountRepository extends BaseRepository<Account> implements IAccountRepository {
  protected get delegate() {
    return prisma.account;
  }

  protected toEntity(raw: unknown): Account {
    return AccountMapper.toDomain(raw as Record<string, unknown>);
  }

  protected toCreateData(data: Partial<Account>): Record<string, unknown> {
    return AccountMapper.toPersistence(data as Account);
  }

  protected toUpdateData(data: Partial<Account>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const fields = [
      "name", "officialName", "subtype", "mask", "currency",
      "isHidden", "lastSyncedAt",
    ] as const;
    for (const field of fields) {
      if ((data as Record<string, unknown>)[field] !== undefined) {
        result[field] = (data as Record<string, unknown>)[field];
      }
    }
    if (data.currentBalance !== undefined) {
      result.currentBalance = data.currentBalance?.toNumber() ?? null;
    }
    if (data.availableBalance !== undefined) {
      result.availableBalance = data.availableBalance?.toNumber() ?? null;
    }
    if (data.limitAmount !== undefined) {
      result.limitAmount = data.limitAmount?.toNumber() ?? null;
    }
    return result;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const raw = await prisma.account.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return raw.map((r) => this.toEntity(r));
  }

  async findByUserIdWithInstitution(userId: string): Promise<{ account: Account; institutionName: string | null }[]> {
    const raw = await prisma.account.findMany({
      where: { userId },
      include: { tellerEnrollment: { select: { institutionName: true } } },
      orderBy: { name: "asc" },
    });
    return raw.map((r) => ({
      account: this.toEntity(r),
      institutionName: (r.tellerEnrollment as { institutionName: string | null } | null)?.institutionName ?? null,
    }));
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Account[]> {
    const raw = await prisma.account.findMany({
      where: { tellerEnrollmentId: enrollmentId },
      orderBy: { name: "asc" },
    });
    return raw.map((r) => this.toEntity(r));
  }

  async findByTellerAccountId(tellerAccountId: string): Promise<Account | null> {
    const raw = await prisma.account.findUnique({ where: { tellerAccountId } });
    return raw ? this.toEntity(raw) : null;
  }

  async upsertByTellerAccountId(data: Partial<Account> & { tellerAccountId: string }): Promise<Account> {
    const createData = this.toCreateData(data as Account);
    const updateData = this.toUpdateData(data);

    const raw = await prisma.account.upsert({
      where: { tellerAccountId: data.tellerAccountId },
      create: createData as Parameters<typeof prisma.account.create>[0]["data"],
      update: updateData as Parameters<typeof prisma.account.update>[0]["data"],
    });
    return this.toEntity(raw);
  }
}
