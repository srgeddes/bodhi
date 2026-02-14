import { BaseEntity } from "./base.entity";
import { Email, Money } from "@/domain/value-objects";

export class User extends BaseEntity {
  email: Email;
  passwordHash: string;
  name: string | null;
  monthlyBudget: Money | null;
  dashboardLayout: Record<string, unknown> | null;

  constructor(params: {
    id?: string;
    email: Email;
    passwordHash: string;
    name?: string | null;
    monthlyBudget?: Money | null;
    dashboardLayout?: Record<string, unknown> | null;
  }) {
    super(params.id);
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.name = params.name ?? null;
    this.monthlyBudget = params.monthlyBudget ?? null;
    this.dashboardLayout = params.dashboardLayout ?? null;
  }

  static create(params: {
    email: string;
    passwordHash: string;
    name?: string;
  }): User {
    return new User({
      email: new Email(params.email),
      passwordHash: params.passwordHash,
      name: params.name,
    });
  }
}
