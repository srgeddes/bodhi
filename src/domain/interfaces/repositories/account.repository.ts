import { Account } from "@/domain/entities";
import { IBaseRepository } from "./base.repository";

export interface IAccountRepository extends IBaseRepository<Account> {
  findByUserId(userId: string): Promise<Account[]>;
  findByUserIdWithInstitution(userId: string): Promise<{ account: Account; institutionName: string | null }[]>;
  findByEnrollmentId(enrollmentId: string): Promise<Account[]>;
  findByTellerAccountId(tellerAccountId: string): Promise<Account | null>;
  upsertByTellerAccountId(data: Partial<Account> & { tellerAccountId: string }): Promise<Account>;
}
