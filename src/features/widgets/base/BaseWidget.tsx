"use client";

import { type ReactNode, type ComponentType } from "react";
import { GripVertical, X, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface BaseWidgetProps {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  isEditing?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRemove?: () => void;
  onRefresh?: () => void;
  children: ReactNode;
  className?: string;
}

export function BaseWidget({
  title,
  icon: Icon,
  isEditing,
  isLoading,
  error,
  onRemove,
  onRefresh,
  children,
  className,
}: BaseWidgetProps) {
  return (
    <BlurFade className="h-full">
      <Card
        className={cn(
          "group flex flex-col h-full overflow-hidden py-0 gap-0",
          isEditing && "ring-2 ring-[var(--success-border)]",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh}>
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            {isEditing && onRemove && (
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={onRemove}>
                <X className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 overflow-auto">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-sm text-destructive">
              {error}
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </BlurFade>
  );
}
