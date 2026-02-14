"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, RefreshCw } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/accounts": "Accounts",
  "/dashboard/transactions": "Transactions",
  "/dashboard/investments": "Investments",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
  "/demo": "Dashboard",
};

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await apiClient.post("/api/accounts/sync");
      toast.success("Accounts synced");
    } catch {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const title = pageTitles[pathname] ?? "Dashboard";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-sm px-6",
        className
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {isDashboardRoute && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-1.5 text-muted-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
            Sync
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <Sun className="h-4 w-4 text-muted-foreground opacity-0" />
          ) : theme === "dark" ? (
            <Sun className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </header>
  );
}
