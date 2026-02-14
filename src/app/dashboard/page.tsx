"use client";

import { useState } from "react";
import { DashboardGrid } from "@/features/dashboard/components/DashboardGrid";
import { DashboardToolbar } from "@/features/dashboard/components/DashboardToolbar";
import { WidgetLibrary } from "@/features/dashboard/components/WidgetLibrary";
import { WelcomeScreen } from "@/features/dashboard/components/WelcomeScreen";
import { CreateFirstWidgetPrompt } from "@/features/dashboard/components/CreateFirstWidgetPrompt";
import { useDashboardState } from "@/features/dashboard/hooks/useDashboardState";
import { useDashboardSync } from "@/features/dashboard/hooks/useDashboardSync";
import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { state, isLoading } = useDashboardState();
  useDashboardSync();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-2 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (state === "no-accounts") {
    return (
      <PageContainer>
        <WelcomeScreen />
      </PageContainer>
    );
  }

  if (state === "no-widgets") {
    return (
      <PageContainer>
        <CreateFirstWidgetPrompt onOpenLibrary={() => setLibraryOpen(true)} />
        <WidgetLibrary open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your financial overview at a glance
          </p>
        </div>
        <DashboardToolbar onOpenLibrary={() => setLibraryOpen(true)} />
      </div>

      <DashboardGrid />
      <WidgetLibrary open={libraryOpen} onClose={() => setLibraryOpen(false)} />
    </PageContainer>
  );
}
