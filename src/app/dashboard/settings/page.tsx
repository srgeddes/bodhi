"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BlurFade } from "@/components/ui/blur-fade";
import { PageContainer } from "@/components/layout";
import { TellerConnectButton } from "@/features/accounts/components/TellerConnectButton";
import { useAuthStore } from "@/store/auth.store";
import { useFetch } from "@/hooks/useFetch";

interface ConnectedAccount {
  id: string;
  institutionName: string;
  accountCount: number;
  lastSynced: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mounted, setMounted] = useState(false);

  const { data: accounts, refetch } = useFetch<ConnectedAccount[]>("/api/accounts");

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <PageContainer>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <BlurFade delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{user?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Appearance */}
        <BlurFade delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              {mounted && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Dark mode</span>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    {[
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={theme === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme(value)}
                        className="flex-1"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Connected Accounts */}
        <BlurFade delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts && accounts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {accounts.map((acct) => (
                    <div
                      key={acct.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {acct.institutionName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {acct.accountCount} account
                          {acct.accountCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Synced {new Date(acct.lastSynced).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-4 text-sm text-muted-foreground">
                  No accounts connected yet.
                </p>
              )}
              <TellerConnectButton onSuccess={refetch} />
            </CardContent>
          </Card>
        </BlurFade>

        {/* Sign Out */}
        <BlurFade delay={0.3}>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </BlurFade>
      </div>
    </PageContainer>
  );
}
