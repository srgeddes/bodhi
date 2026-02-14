import {
  AccountType,
  accountTypeFromTeller,
} from "@/domain/enums/account-type.enum";
import { EnrollmentStatus } from "@/domain/enums/enrollment-status.enum";
import { CategorySource } from "@/domain/enums/category-source.enum";

describe("AccountType", () => {
  it("has expected enum values", () => {
    expect(AccountType.Depository).toBe("DEPOSITORY");
    expect(AccountType.Credit).toBe("CREDIT");
    expect(AccountType.Investment).toBe("INVESTMENT");
    expect(AccountType.Loan).toBe("LOAN");
    expect(AccountType.Brokerage).toBe("BROKERAGE");
    expect(AccountType.Other).toBe("OTHER");
  });
});

describe("accountTypeFromTeller", () => {
  it("maps 'depository' to AccountType.Depository", () => {
    expect(accountTypeFromTeller("depository")).toBe(AccountType.Depository);
  });

  it("maps 'credit' to AccountType.Credit", () => {
    expect(accountTypeFromTeller("credit")).toBe(AccountType.Credit);
  });

  it("returns AccountType.Other for unknown Teller types", () => {
    expect(accountTypeFromTeller("unknown")).toBe(AccountType.Other);
    expect(accountTypeFromTeller("investment")).toBe(AccountType.Other);
    expect(accountTypeFromTeller("loan")).toBe(AccountType.Other);
  });

  it("handles case-insensitive input", () => {
    expect(accountTypeFromTeller("DEPOSITORY")).toBe(AccountType.Depository);
    expect(accountTypeFromTeller("Credit")).toBe(AccountType.Credit);
  });
});

describe("EnrollmentStatus", () => {
  it("has expected enum values", () => {
    expect(EnrollmentStatus.Active).toBe("ACTIVE");
    expect(EnrollmentStatus.Degraded).toBe("DEGRADED");
    expect(EnrollmentStatus.Disconnected).toBe("DISCONNECTED");
  });
});

describe("CategorySource", () => {
  it("has expected enum values", () => {
    expect(CategorySource.Teller).toBe("TELLER");
    expect(CategorySource.Ai).toBe("AI");
    expect(CategorySource.Rule).toBe("RULE");
    expect(CategorySource.UserOverride).toBe("USER_OVERRIDE");
  });
});
