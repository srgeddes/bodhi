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
  heb: "heb.com",
  sprouts: "sprouts.com",
  "food lion": "foodlion.com",
  "stop & shop": "stopandshop.com",
  "giant eagle": "gianteagle.com",
  "harris teeter": "harristeeter.com",
  albertsons: "albertsons.com",
  "piggly wiggly": "pigglywiggly.com",
  meijer: "meijer.com",
  "winco foods": "wincofoods.com",
  winco: "wincofoods.com",
  "winn-dixie": "winndixie.com",
  "food 4 less": "food4less.com",
  "fresh market": "thefreshmarket.com",

  // Restaurants & Coffee
  starbucks: "starbucks.com",
  "dunkin donuts": "dunkindonuts.com",
  dunkin: "dunkindonuts.com",
  chipotle: "chipotle.com",
  "chick-fil-a": "chick-fil-a.com",
  "chick fil a": "chick-fil-a.com",
  chickfila: "chick-fil-a.com",
  mcdonalds: "mcdonalds.com",
  "mcdonald's": "mcdonalds.com",
  "taco bell": "tacobell.com",
  "panera bread": "panerabread.com",
  panera: "panerabread.com",
  subway: "subway.com",
  "olive garden": "olivegarden.com",
  "wendy's": "wendys.com",
  wendys: "wendys.com",
  "domino's": "dominos.com",
  dominos: "dominos.com",
  "pizza hut": "pizzahut.com",
  "papa johns": "papajohns.com",
  "papa john's": "papajohns.com",
  "burger king": "bk.com",
  "popeyes": "popeyes.com",
  "five guys": "fiveguys.com",
  "shake shack": "shakeshack.com",
  "in-n-out": "in-n-out.com",
  "panda express": "pandaexpress.com",
  "jack in the box": "jackinthebox.com",
  "sonic": "sonicdrivein.com",
  "wingstop": "wingstop.com",
  "jersey mike's": "jerseymikes.com",
  "jersey mikes": "jerseymikes.com",
  "jimmy john's": "jimmyjohns.com",
  "jimmy johns": "jimmyjohns.com",
  "cracker barrel": "crackerbarrel.com",
  "denny's": "dennys.com",
  dennys: "dennys.com",
  "waffle house": "wafflehouse.com",
  "cheesecake factory": "thecheesecakefactory.com",
  "red lobster": "redlobster.com",
  "texas roadhouse": "texasroadhouse.com",
  "applebee's": "applebees.com",
  applebees: "applebees.com",
  ihop: "ihop.com",
  "buffalo wild wings": "buffalowildwings.com",
  "chili's": "chilis.com",
  chilis: "chilis.com",
  sweetgreen: "sweetgreen.com",
  "cava": "cava.com",
  "noodles & company": "noodles.com",

  // Coffee & Bakery
  "peet's coffee": "peets.com",
  peets: "peets.com",
  "caribou coffee": "cariboucoffee.com",
  "dutch bros": "dutchbros.com",
  "krispy kreme": "krispykreme.com",
  "tim hortons": "timhortons.com",

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
  "dollar general": "dollargeneral.com",
  "family dollar": "familydollar.com",
  "tj maxx": "tjmaxx.com",
  marshalls: "marshalls.com",
  "ross": "rossstores.com",
  "burlington": "burlington.com",
  "bed bath & beyond": "bedbathandbeyond.com",
  sephora: "sephora.com",
  ulta: "ulta.com",
  "bath & body works": "bathandbodyworks.com",
  "victoria's secret": "victoriassecret.com",
  "pottery barn": "potterybarn.com",
  "crate & barrel": "crateandbarrel.com",
  "williams-sonoma": "williams-sonoma.com",
  "restoration hardware": "rh.com",
  rh: "rh.com",
  "banana republic": "bananarepublic.com",
  "j.crew": "jcrew.com",
  jcrew: "jcrew.com",
  zara: "zara.com",
  "h&m": "hm.com",
  uniqlo: "uniqlo.com",
  adidas: "adidas.com",
  "under armour": "underarmour.com",
  "lululemon": "lululemon.com",
  "foot locker": "footlocker.com",
  "dick's sporting goods": "dickssportinggoods.com",
  "rei": "rei.com",
  "michael's": "michaels.com",
  michaels: "michaels.com",
  "hobby lobby": "hobbylobby.com",
  "ace hardware": "acehardware.com",
  "harbor freight": "harborfreight.com",
  "menards": "menards.com",
  "autozone": "autozone.com",
  "o'reilly auto": "oreillyauto.com",
  "advance auto": "advanceautoparts.com",
  "petsmart": "petsmart.com",
  "petco": "petco.com",
  "chewy": "chewy.com",

  // Online Shopping
  etsy: "etsy.com",
  ebay: "ebay.com",
  "wayfair": "wayfair.com",
  "overstock": "overstock.com",
  "shopify": "shopify.com",
  "wish": "wish.com",
  aliexpress: "aliexpress.com",
  "shein": "shein.com",
  "temu": "temu.com",

  // Streaming & Entertainment
  netflix: "netflix.com",
  spotify: "spotify.com",
  hulu: "hulu.com",
  "disney+": "disneyplus.com",
  "disney plus": "disneyplus.com",
  "apple tv": "tv.apple.com",
  "apple tv+": "tv.apple.com",
  "apple music": "apple.com",
  "hbo max": "max.com",
  max: "max.com",
  "youtube premium": "youtube.com",
  youtube: "youtube.com",
  "prime video": "primevideo.com",
  "amazon prime": "amazon.com",
  amc: "amctheatres.com",
  "amc theatres": "amctheatres.com",
  "paramount+": "paramountplus.com",
  "paramount plus": "paramountplus.com",
  peacock: "peacocktv.com",
  "discovery+": "discoveryplus.com",
  "audible": "audible.com",
  "kindle": "amazon.com",
  "xbox": "xbox.com",
  playstation: "playstation.com",
  "nintendo": "nintendo.com",
  steam: "steampowered.com",
  twitch: "twitch.tv",
  "apple arcade": "apple.com",

  // Food Delivery
  doordash: "doordash.com",
  grubhub: "grubhub.com",
  "uber eats": "ubereats.com",
  ubereats: "ubereats.com",
  postmates: "postmates.com",
  instacart: "instacart.com",
  gopuff: "gopuff.com",

  // Transportation & Gas
  uber: "uber.com",
  lyft: "lyft.com",
  shell: "shell.com",
  "shell gas station": "shell.com",
  chevron: "chevron.com",
  exxon: "exxon.com",
  exxonmobil: "exxon.com",
  bp: "bp.com",
  sunoco: "sunoco.com",
  "marathon": "marathonpetroleum.com",
  "phillips 66": "phillips66.com",
  "circle k": "circlek.com",
  "wawa": "wawa.com",
  "sheetz": "sheetz.com",
  "7-eleven": "7-eleven.com",
  "quiktrip": "quiktrip.com",

  // Airlines
  "american airlines": "aa.com",
  delta: "delta.com",
  "delta air lines": "delta.com",
  united: "united.com",
  "united airlines": "united.com",
  southwest: "southwest.com",
  "southwest airlines": "southwest.com",
  jetblue: "jetblue.com",
  frontier: "flyfrontier.com",
  "frontier airlines": "flyfrontier.com",
  spirit: "spirit.com",
  "spirit airlines": "spirit.com",
  alaska: "alaskaair.com",
  "alaska airlines": "alaskaair.com",

  // Travel & Lodging
  airbnb: "airbnb.com",
  "booking.com": "booking.com",
  expedia: "expedia.com",
  "hotels.com": "hotels.com",
  marriott: "marriott.com",
  hilton: "hilton.com",
  hyatt: "hyatt.com",
  "holiday inn": "ihg.com",
  vrbo: "vrbo.com",

  // Health & Fitness
  "planet fitness": "planetfitness.com",
  equinox: "equinox.com",
  "la fitness": "lafitness.com",
  "orange theory": "orangetheory.com",
  orangetheory: "orangetheory.com",
  peloton: "onepeloton.com",
  "anytime fitness": "anytimefitness.com",
  "lifetime fitness": "lifetime.life",
  "24 hour fitness": "24hourfitness.com",
  "crunch fitness": "crunch.com",
  "gold's gym": "goldsgym.com",
  "crossfit": "crossfit.com",
  "barry's": "barrys.com",
  "soulcycle": "soul-cycle.com",

  // Insurance
  "state farm": "statefarm.com",
  geico: "geico.com",
  progressive: "progressive.com",
  allstate: "allstate.com",
  "liberty mutual": "libertymutual.com",
  "farmers insurance": "farmers.com",
  usaa: "usaa.com",
  "nationwide": "nationwide.com",

  // Healthcare & Pharmacy
  "rite aid": "riteaid.com",
  "quest diagnostics": "questdiagnostics.com",
  labcorp: "labcorp.com",
  "kaiser permanente": "kaiserpermanente.org",
  kaiser: "kaiserpermanente.org",
  "united healthcare": "uhc.com",
  "blue cross": "bcbs.com",
  "cigna": "cigna.com",
  "aetna": "aetna.com",
  "humana": "humana.com",
  "anthem": "anthem.com",

  // Utilities & Services
  "at&t": "att.com",
  att: "att.com",
  "t-mobile": "t-mobile.com",
  tmobile: "t-mobile.com",
  verizon: "verizon.com",
  comcast: "comcast.com",
  xfinity: "xfinity.com",
  spectrum: "spectrum.com",
  "cox": "cox.com",
  "centurylink": "centurylink.com",
  "google fi": "fi.google.com",
  "mint mobile": "mintmobile.com",
  "cricket wireless": "cricketwireless.com",
  "boost mobile": "boostmobile.com",

  // Software & Subscriptions
  google: "google.com",
  "google cloud": "cloud.google.com",
  microsoft: "microsoft.com",
  "microsoft 365": "microsoft.com",
  "office 365": "microsoft.com",
  adobe: "adobe.com",
  dropbox: "dropbox.com",
  slack: "slack.com",
  zoom: "zoom.us",
  notion: "notion.so",
  github: "github.com",
  linkedin: "linkedin.com",
  "linkedin premium": "linkedin.com",
  openai: "openai.com",
  chatgpt: "openai.com",
  "icloud": "icloud.com",
  "google one": "one.google.com",

  // Payments & Finance
  venmo: "venmo.com",
  paypal: "paypal.com",
  "cash app": "cash.app",
  zelle: "zellepay.com",
  "apple pay": "apple.com",
  "google pay": "pay.google.com",
  stripe: "stripe.com",
  square: "squareup.com",
  wise: "wise.com",
  "coinbase": "coinbase.com",
  "robinhood": "robinhood.com",
  "wealthfront": "wealthfront.com",
  "betterment": "betterment.com",
  "acorns": "acorns.com",

  // Education
  "coursera": "coursera.org",
  "udemy": "udemy.com",
  "skillshare": "skillshare.com",
  "masterclass": "masterclass.com",
  "duolingo": "duolingo.com",
  "chegg": "chegg.com",
};

/**
 * Plaid merchant names are often noisy:
 * "STARBUCKS #12345 SAN FRANCISCO CA"
 * "UBER *EATS PENDING"
 * "SQ *SWEETGREEN DOWNTOWN"
 * "TST* JOE'S PIZZA"
 *
 * This normalizes them to a clean matchable form.
 */
function normalizeMerchantName(name: string): string {
  let cleaned = name.toLowerCase().replace(/['']/g, "'").trim();

  // Strip common Plaid/payment prefixes
  cleaned = cleaned
    .replace(/^(sq \*|sq\*|tst\*|tst \*|pp\*|sp \*|sp\*)/, "")
    .replace(/^(in \*|olo \*|chk\*|grb\*)/, "")
    .trim();

  // Strip "PENDING", "RECURRING", "AUTOPAY" suffixes
  cleaned = cleaned.replace(/\s+(pending|recurring|autopay|payment|purchase)$/i, "");

  // Strip store/location numbers: "#12345", "# 123", "store 42"
  cleaned = cleaned.replace(/\s*#\s*\d+/g, "");
  cleaned = cleaned.replace(/\s+store\s+\d+/gi, "");

  // Strip trailing city/state/zip patterns: "SAN FRANCISCO CA", "NY 10001", "CA 94105"
  cleaned = cleaned.replace(
    /\s+[A-Z]{2}\s*\d{5}(-\d{4})?$/i,
    ""
  );
  // Common pattern: "CITY ST" at end (two-letter state code)
  cleaned = cleaned.replace(
    /\s+\w+\s+[a-z]{2}$/i,
    ""
  );

  // Strip asterisks and extra whitespace
  cleaned = cleaned.replace(/\*/g, " ").replace(/\s+/g, " ").trim();

  return cleaned;
}

export function getMerchantDomain(merchantName: string): string | null {
  const key = normalizeMerchantName(merchantName);

  // Exact match
  if (MERCHANT_DOMAINS[key]) return MERCHANT_DOMAINS[key];

  // Partial match — check if any known merchant is contained in the name or vice versa
  for (const [merchant, domain] of Object.entries(MERCHANT_DOMAINS)) {
    if (key.includes(merchant) || merchant.includes(key)) {
      return domain;
    }
  }

  // Domain derivation fallback — try the cleaned name as a domain
  // Only attempt if the name looks like it could be a single brand (1-3 words, no weird chars)
  const words = key.split(" ").filter(Boolean);
  if (words.length >= 1 && words.length <= 3) {
    const derived = words.join("") + ".com";
    // Sanity check: derived domain should be reasonable length and alphanumeric
    if (/^[a-z0-9-]+\.com$/.test(derived) && derived.length > 5 && derived.length < 40) {
      return derived;
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
