import { institutions } from "@/config/institutions";

const institutionDomainMap = new Map<string, string>();
for (const inst of institutions) {
  institutionDomainMap.set(inst.name.toLowerCase(), inst.domain);
  // Also map by tellerId for fallback
  institutionDomainMap.set(inst.tellerId.toLowerCase(), inst.domain);
}

export function getInstitutionDomain(institutionName: string): string | null {
  const key = institutionName.toLowerCase().trim();
  if (institutionDomainMap.has(key)) return institutionDomainMap.get(key)!;

  // Partial match
  for (const [name, domain] of institutionDomainMap.entries()) {
    if (key.includes(name) || name.includes(key)) return domain;
  }

  // Derive domain from name as fallback (e.g. "Capital One" → "capitalone.com")
  const derived = key.replace(/[^a-z0-9]/g, "") + ".com";
  if (derived.length > 4) return derived;

  return null;
}

export function getInstitutionLogoUrl(institutionName: string, size: number = 80): string | null {
  const domain = getInstitutionDomain(institutionName);
  if (!domain) return null;
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "demo";
  return `https://img.logo.dev/${domain}?token=${token}&size=${size}`;
}
