"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { getMerchantLogoUrl } from "@/utils/merchant-logo.utils";
import { cn } from "@/lib/utils";

interface MerchantLogoProps {
  merchantName: string;
  size?: number;
  className?: string;
}

export function MerchantLogo({ merchantName, size = 28, className }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getMerchantLogoUrl(merchantName, size * 2);

  if (!logoUrl || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-muted",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Store className="text-muted-foreground" style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={merchantName}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}
