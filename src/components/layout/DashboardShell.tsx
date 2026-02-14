"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Particles } from "@/components/ui/particles";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, fetchUser } = useAuthStore();

  // Fetch user once on mount. Logout does a hard redirect (window.location.href)
  // which fully unloads the page, so this won't re-trigger after logout.
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto relative">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <Particles className="absolute inset-0" quantity={15} size={0.3} staticity={90} color="var(--primary)" />
            <DotPattern className={cn("absolute inset-0 opacity-[0.02]", "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]")} />
          </div>
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
