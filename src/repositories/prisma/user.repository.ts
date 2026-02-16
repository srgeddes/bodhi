import { prisma } from "@/lib/db";
import { BaseRepository } from "../base.repository";
import { User } from "@/domain/entities";
import { IUserRepository } from "@/domain/interfaces/repositories";
import { UserMapper } from "@/mappers";

export class PrismaUserRepository extends BaseRepository<User> implements IUserRepository {
  protected get delegate() {
    return prisma.user;
  }

  protected toEntity(raw: unknown): User {
    return UserMapper.toDomain(raw as Record<string, unknown>);
  }

  protected toCreateData(data: Partial<User>): Record<string, unknown> {
    return UserMapper.toPersistence(data as User);
  }

  protected toUpdateData(data: Partial<User>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.name !== undefined) result.name = data.name;
    if (data.passwordHash !== undefined) result.passwordHash = data.passwordHash;
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { email } });
    return raw ? this.toEntity(raw) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }

  async updateEmailVerified(userId: string, emailVerified: boolean): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified },
    });
  }

  async updateMfaEnabled(userId: string, mfaEnabled: boolean): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled },
    });
  }
}
