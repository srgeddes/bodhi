const MERCHANT_DOMAINS: Record<string, string> = {
  // Grocery
  "whole foods": "wholefoods.com",
  "whole foods market": "wholefoods.com",
  "trader joe's": "traderjoes.com",
  "trader joes": "traderjoes.com",
  kroger: "kroger.com",
  safeway: "safeway.com",
  aldi: "aldi.us",
  costco: "costco.com",
  "sam's club": "samsclub.com",
  publix: "publix.com",
  wegmans: "wegmans.com",
  "h-e-b": "heb.com",
  sprouts: "sprouts.com",

  // Restaurants & Coffee
  starbucks: "starbucks.com",
  "dunkin donuts": "dunkindonuts.com",
  dunkin: "dunkindonuts.com",
  chipotle: "chipotle.com",
  "chick-fil-a": "chick-fil-a.com",
  mcdonalds: "mcdonalds.com",
  "mcdonald's": "mcdonalds.com",
  "taco bell": "tacobell.com",
  "panera bread": "panerabread.com",
  panera: "panerabread.com",
  subway: "subway.com",
  "olive garden": "olivegarden.com",
  wendy: "wendys.com",
  "wendy's": "wendys.com",
  "domino's": "dominos.com",
  dominos: "dominos.com",
  "pizza hut": "pizzahut.com",
  "papa johns": "papajohns.com",

  // Retail
  amazon: "amazon.com",
  target: "target.com",
  walmart: "walmart.com",
  "best buy": "bestbuy.com",
  "home depot": "homedepot.com",
  lowes: "lowes.com",
  "lowe's": "lowes.com",
  ikea: "ikea.com",
  nordstrom: "nordstrom.com",
  macys: "macys.com",
  "macy's": "macys.com",
  gap: "gap.com",
  "old navy": "oldnavy.com",
  nike: "nike.com",
  apple: "apple.com",
  cvs: "cvs.com",
  walgreens: "walgreens.com",
  "dollar tree": "dollartree.com",

  // Streaming & Entertainment
  netflix: "netflix.com",
  spotify: "spotify.com",
  hulu: "hulu.com",
  "disney+": "disneyplus.com",
  "disney plus": "disneyplus.com",
  "apple tv": "tv.apple.com",
  "hbo max": "max.com",
  "youtube premium": "youtube.com",
  youtube: "youtube.com",
  "prime video": "primevideo.com",
  amc: "amctheatres.com",
  "amc theatres": "amctheatres.com",

  // Transportation & Gas
  uber: "uber.com",
  lyft: "lyft.com",
  shell: "shell.com",
  "shell gas station": "shell.com",
  chevron: "chevron.com",
  exxon: "exxon.com",
  bp: "bp.com",

  // Health & Fitness
  "planet fitness": "planetfitness.com",
  "equinox": "equinox.com",
  "la fitness": "lafitness.com",
  "orange theory": "orangetheory.com",
  peloton: "onepeloton.com",

  // Utilities & Services
  "at&t": "att.com",
  "t-mobile": "t-mobile.com",
  verizon: "verizon.com",
  comcast: "comcast.com",
  xfinity: "xfinity.com",
  spectrum: "spectrum.com",

  // Payments & Finance
  venmo: "venmo.com",
  paypal: "paypal.com",
  "cash app": "cash.app",
  zelle: "zellepay.com",
};

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/['']/g, "'").trim();
}

export function getMerchantDomain(merchantName: string): string | null {
  const key = normalizeKey(merchantName);

  // Exact match
  if (MERCHANT_DOMAINS[key]) return MERCHANT_DOMAINS[key];

  // Partial match — check if any known merchant is contained in the name
  for (const [merchant, domain] of Object.entries(MERCHANT_DOMAINS)) {
    if (key.includes(merchant) || merchant.includes(key)) {
      return domain;
    }
  }

  return null;
}

export function getMerchantLogoUrl(
  merchantName: string,
  size: number = 40
): string | null {
  const domain = getMerchantDomain(merchantName);
  if (!domain) return null;
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "demo";
  return `https://img.logo.dev/${domain}?token=${token}&size=${size}`;
}
