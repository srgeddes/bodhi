"use client";

import { DemoProvider } from "@/features/demo/DemoProvider";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Particles } from "@/components/ui/particles";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export function DemoShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <div className="flex items-center justify-center gap-2 border-b border-border bg-primary/5 px-4 py-1.5">
            <Badge variant="secondary" className="text-xs">Demo Mode</Badge>
            <span className="text-xs text-muted-foreground">Viewing sample data</span>
          </div>
          <main className="flex-1 overflow-auto relative">
            <div className="absolute inset-0 -z-10 pointer-events-none">
              <Particles className="absolute inset-0" quantity={15} size={0.3} staticity={90} color="var(--primary)" />
              <DotPattern className={cn("absolute inset-0 opacity-[0.02]", "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]")} />
            </div>
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </DemoProvider>
  );
}
