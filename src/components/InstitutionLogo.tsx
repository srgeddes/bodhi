"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { getInstitutionLogoUrl } from "@/utils/institution-logo.utils";
import { cn } from "@/lib/utils";

interface InstitutionLogoProps {
  institutionName: string;
  size?: number;
  className?: string;
}

export function InstitutionLogo({ institutionName, size = 24, className }: InstitutionLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getInstitutionLogoUrl(institutionName, size * 2);

  if (!logoUrl || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-muted",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Building2 className="text-muted-foreground" style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={institutionName}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}
