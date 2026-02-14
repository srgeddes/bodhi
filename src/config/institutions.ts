export interface Institution {
  name: string;
  domain: string;
  tellerId: string;
  types: ("depository" | "credit" | "investment" | "loan")[];
}

export const institutions: Institution[] = [
  { name: "Chase", domain: "chase.com", tellerId: "chase", types: ["depository", "credit"] },
  { name: "Bank of America", domain: "bankofamerica.com", tellerId: "bank_of_america", types: ["depository", "credit"] },
  { name: "Wells Fargo", domain: "wellsfargo.com", tellerId: "wells_fargo", types: ["depository", "credit"] },
  { name: "Capital One", domain: "capitalone.com", tellerId: "capital_one", types: ["depository", "credit"] },
  { name: "Citi", domain: "citi.com", tellerId: "citi", types: ["depository", "credit"] },
  { name: "American Express", domain: "americanexpress.com", tellerId: "amex", types: ["credit"] },
  { name: "US Bank", domain: "usbank.com", tellerId: "us_bank", types: ["depository", "credit"] },
  { name: "PNC", domain: "pnc.com", tellerId: "pnc", types: ["depository", "credit"] },
  { name: "TD Bank", domain: "td.com", tellerId: "td_bank", types: ["depository", "credit"] },
  { name: "Discover", domain: "discover.com", tellerId: "discover", types: ["depository", "credit"] },
  { name: "Ally", domain: "ally.com", tellerId: "ally", types: ["depository"] },
  { name: "USAA", domain: "usaa.com", tellerId: "usaa", types: ["depository", "credit", "investment"] },
  { name: "Navy Federal", domain: "navyfederal.org", tellerId: "navy_federal", types: ["depository", "credit"] },
  { name: "Vanguard", domain: "vanguard.com", tellerId: "vanguard", types: ["investment"] },
  { name: "Fidelity", domain: "fidelity.com", tellerId: "fidelity", types: ["investment", "depository"] },
  { name: "Charles Schwab", domain: "schwab.com", tellerId: "schwab", types: ["investment", "depository"] },
  { name: "E*TRADE", domain: "etrade.com", tellerId: "etrade", types: ["investment"] },
  { name: "Robinhood", domain: "robinhood.com", tellerId: "robinhood", types: ["investment"] },
  { name: "SoFi", domain: "sofi.com", tellerId: "sofi", types: ["depository", "investment", "loan"] },
  { name: "Marcus by Goldman Sachs", domain: "marcus.com", tellerId: "marcus", types: ["depository"] },
  { name: "Synchrony", domain: "synchrony.com", tellerId: "synchrony", types: ["credit", "depository"] },
  { name: "Nelnet", domain: "nelnet.com", tellerId: "nelnet", types: ["loan"] },
  { name: "Great Lakes", domain: "mygreatlakes.org", tellerId: "great_lakes", types: ["loan"] },
  { name: "Rocket Mortgage", domain: "rocketmortgage.com", tellerId: "rocket_mortgage", types: ["loan"] },
];
