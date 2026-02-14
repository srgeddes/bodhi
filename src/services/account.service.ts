import { BaseService } from "./base.service";
import { Account } from "@/domain/entities";
import { ForbiddenError } from "@/domain/errors";
import { IAccountRepository } from "@/domain/interfaces/repositories";

export class AccountService extends BaseService<Account> {
  protected readonly entityName = "Account";

  constructor(private readonly accountRepository: IAccountRepository) {
    super(accountRepository);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Account[]> {
    return this.accountRepository.findByEnrollmentId(enrollmentId);
  }

  async findByUserIdWithInstitution(userId: string): Promise<{ account: Account; institutionName: string | null }[]> {
    return this.accountRepository.findByUserIdWithInstitution(userId);
  }

  async upsertByTellerAccountId(data: Partial<Account> & { tellerAccountId: string }): Promise<Account> {
    return this.accountRepository.upsertByTellerAccountId(data);
  }

  async hideAccount(id: string, userId: string): Promise<Account> {
    const account = await this.findById(id);
    this.verifyOwnership(account, userId);
    return this.accountRepository.update(id, { isHidden: true } as Partial<Account>);
  }

  async unhideAccount(id: string, userId: string): Promise<Account> {
    const account = await this.findById(id);
    this.verifyOwnership(account, userId);
    return this.accountRepository.update(id, { isHidden: false } as Partial<Account>);
  }

  async findByIdForUser(id: string, userId: string): Promise<Account> {
    const account = await this.findById(id);
    this.verifyOwnership(account, userId);
    return account;
  }

  private verifyOwnership(account: Account, userId: string): void {
    if (account.userId !== userId) {
      throw new ForbiddenError("You do not have access to this account");
    }
  }
}
