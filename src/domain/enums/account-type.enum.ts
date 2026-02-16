export enum AccountType {
  Depository = "DEPOSITORY",
  Credit = "CREDIT",
  Investment = "INVESTMENT",
  Loan = "LOAN",
  Brokerage = "BROKERAGE",
  Other = "OTHER",
}

export function accountTypeFromTeller(tellerType: string): AccountType {
  const mapping: Record<string, AccountType> = {
    depository: AccountType.Depository,
    credit: AccountType.Credit,
    loan: AccountType.Loan,
    mortgage: AccountType.Loan,
    investment: AccountType.Investment,
  };
  return mapping[tellerType.toLowerCase()] ?? AccountType.Other;
}
