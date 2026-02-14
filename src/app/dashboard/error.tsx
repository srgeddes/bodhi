"use client";

import { ErrorDisplay } from "@/components/feedback";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <ErrorDisplay message={error.message} onRetry={reset} />
    </div>
  );
}
