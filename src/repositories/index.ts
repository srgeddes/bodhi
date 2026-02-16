import { PrismaUserRepository } from "./prisma/user.repository";
import { PrismaTellerEnrollmentRepository } from "./prisma/teller-enrollment.repository";
import { PrismaAccountRepository } from "./prisma/account.repository";
import { PrismaTransactionRepository } from "./prisma/transaction.repository";

export const userRepository = new PrismaUserRepository();
export const tellerEnrollmentRepository = new PrismaTellerEnrollmentRepository();
export const accountRepository = new PrismaAccountRepository();
export const transactionRepository = new PrismaTransactionRepository();
