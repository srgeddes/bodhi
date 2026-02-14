"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <BlurFade>
      <div className={cn("px-6 py-6 max-w-7xl mx-auto w-full", className)}>
        {children}
      </div>
    </BlurFade>
  );
}
