import {
  userRepository,
  tellerEnrollmentRepository,
  accountRepository,
  transactionRepository,
} from "@/repositories";
import { UserService } from "./user.service";
import { TellerService } from "./teller.service";
import { TellerEnrollmentService } from "./teller-enrollment.service";
import { AccountService } from "./account.service";
import { TransactionService } from "./transaction.service";

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
