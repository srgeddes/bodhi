import { BaseEntity } from "./base.entity";
import { Email, Money } from "@/domain/value-objects";

export class User extends BaseEntity {
  email: Email;
  passwordHash: string;
  name: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  isDemo: boolean;
  monthlyBudget: Money | null;
  dashboardLayout: Record<string, unknown> | null;

  constructor(params: {
    id?: string;
    email: Email;
    passwordHash: string;
    name?: string | null;
    emailVerified?: boolean;
    mfaEnabled?: boolean;
    isDemo?: boolean;
    monthlyBudget?: Money | null;
    dashboardLayout?: Record<string, unknown> | null;
  }) {
    super(params.id);
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.name = params.name ?? null;
    this.emailVerified = params.emailVerified ?? false;
    this.mfaEnabled = params.mfaEnabled ?? false;
    this.isDemo = params.isDemo ?? false;
    this.monthlyBudget = params.monthlyBudget ?? null;
    this.dashboardLayout = params.dashboardLayout ?? null;
  }

  static create(params: {
    email: string;
    passwordHash: string;
    name?: string;
    isDemo?: boolean;
  }): User {
    return new User({
      email: new Email(params.email),
      passwordHash: params.passwordHash,
      name: params.name,
      isDemo: params.isDemo,
    });
  }
}
