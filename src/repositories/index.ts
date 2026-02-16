import { PrismaUserRepository } from "./prisma/user.repository";
import { PrismaTellerEnrollmentRepository } from "./prisma/teller-enrollment.repository";
import { PrismaAccountRepository } from "./prisma/account.repository";
import { PrismaTransactionRepository } from "./prisma/transaction.repository";
import { PrismaOtpRepository } from "./prisma/otp.repository";
import { PrismaBackupCodeRepository } from "./prisma/backup-code.repository";

export const userRepository = new PrismaUserRepository();
export const tellerEnrollmentRepository = new PrismaTellerEnrollmentRepository();
export const accountRepository = new PrismaAccountRepository();
export const transactionRepository = new PrismaTransactionRepository();
export const otpRepository = new PrismaOtpRepository();
export const backupCodeRepository = new PrismaBackupCodeRepository();
