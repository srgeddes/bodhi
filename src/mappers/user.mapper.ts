import { Decimal } from "@prisma/client/runtime/library";
import { BaseMapper } from "./base.mapper";
import { User } from "@/domain/entities";
import { Email, Money } from "@/domain/value-objects";

interface UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  monthlyBudget: number | null;
  createdAt: string;
  updatedAt: string;
}

class UserMapperImpl extends BaseMapper<User, UserResponseDto> {
  toDto(entity: User): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email.value,
      name: entity.name,
      emailVerified: entity.emailVerified,
      mfaEnabled: entity.mfaEnabled,
      monthlyBudget: entity.monthlyBudget?.toNumber() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toDomain(raw: Record<string, unknown>): User {
    const budgetValue = raw.monthlyBudget != null
      ? (raw.monthlyBudget instanceof Decimal
          ? raw.monthlyBudget.toString()
          : String(raw.monthlyBudget))
      : null;

    const user = new User({
      id: raw.id as string,
      email: new Email(raw.email as string),
      passwordHash: raw.passwordHash as string,
      name: (raw.name as string) ?? null,
      emailVerified: (raw.emailVerified as boolean) ?? false,
      mfaEnabled: (raw.mfaEnabled as boolean) ?? false,
      isDemo: (raw.isDemo as boolean) ?? false,
      monthlyBudget: budgetValue != null ? new Money(budgetValue, "USD") : null,
      dashboardLayout: (raw.dashboardLayout as Record<string, unknown>) ?? null,
    });
    Object.assign(user, {
      createdAt: new Date(raw.createdAt as string),
      updatedAt: new Date(raw.updatedAt as string),
    });
    return user;
  }

  toPersistence(entity: User): Record<string, unknown> {
    return {
      id: entity.id,
      email: entity.email.value,
      passwordHash: entity.passwordHash,
      name: entity.name,
      emailVerified: entity.emailVerified,
      mfaEnabled: entity.mfaEnabled,
      isDemo: entity.isDemo,
      monthlyBudget: entity.monthlyBudget
        ? new Decimal(entity.monthlyBudget.toNumber())
        : null,
      dashboardLayout: entity.dashboardLayout,
    };
  }
}

export const UserMapper = new UserMapperImpl();
