"use client";

import { type ReactNode } from "react";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/feedback";

interface BaseChartProps {
  config: ChartConfig;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  height?: number;
  children: ReactNode;
}

export function BaseChart({
  config,
  className,
  isLoading,
  isEmpty,
  emptyMessage = "No data available",
  height,
  children,
}: BaseChartProps) {
  const sizeProps = height
    ? { style: { height } }
    : { className: "h-full" };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", className, sizeProps.className)} style={sizeProps.style}>
        <LoadingSpinner />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn("flex items-center justify-center text-sm text-muted-foreground", className, sizeProps.className)} style={sizeProps.style}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ChartContainer
      config={config}
      className={cn("w-full [aspect-ratio:unset]", className, sizeProps.className)}
      style={sizeProps.style}
    >
      {children as React.ReactElement}
    </ChartContainer>
  );
}
