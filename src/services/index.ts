import {
  userRepository,
  tellerEnrollmentRepository,
  accountRepository,
  transactionRepository,
  otpRepository,
  backupCodeRepository,
} from "@/repositories";
import { UserService } from "./user.service";
import { TellerService } from "./teller.service";
import { TellerEnrollmentService } from "./teller-enrollment.service";
import { AccountService } from "./account.service";
import { TransactionService } from "./transaction.service";
import { EmailService } from "./email.service";
import { VerificationService } from "./verification.service";
import { MfaService } from "./mfa.service";

export const tellerService = new TellerService();
export const userService = new UserService(userRepository);
export const accountService = new AccountService(accountRepository);
export const transactionService = new TransactionService(transactionRepository);
export const tellerEnrollmentService = new TellerEnrollmentService(
  tellerEnrollmentRepository,
  tellerService,
  accountService,
  transactionService
);

export const emailService = new EmailService();
export const verificationService = new VerificationService(
  otpRepository,
  userRepository,
  emailService
);
export const mfaService = new MfaService(
  otpRepository,
  backupCodeRepository,
  userRepository,
  emailService
);

// Wire circular dependencies
userService.setVerificationService(verificationService);
userService.setMfaService(mfaService);
