"use client";

import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <BlurFade>
      <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
        {Icon && <Icon className="h-10 w-10 text-muted-foreground/40" />}
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </BlurFade>
  );
}
