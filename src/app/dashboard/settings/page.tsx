"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut, ShieldCheck, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BlurFade } from "@/components/ui/blur-fade";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageContainer } from "@/components/layout";
import { TellerConnectButton } from "@/features/accounts/components/TellerConnectButton";
import { useAuthStore } from "@/store/auth.store";
import { useFetch } from "@/hooks/useFetch";
import { apiClient } from "@/lib/api-client";

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
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [mounted, setMounted] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: accounts, refetch } = useFetch<ConnectedAccount[]>("/api/accounts");

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U";

  const handleMfaToggle = async (enabled: boolean) => {
    setMfaLoading(true);
    setMfaError(null);
    setBackupCodes(null);
    try {
      const res = await apiClient.post<{ data: { message: string; backupCodes?: string[] } }>(
        "/api/auth/mfa",
        { action: enabled ? "enable" : "disable" }
      );
      if (res.data.backupCodes) {
        setBackupCodes(res.data.backupCodes);
      }
      await fetchUser();
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : "Failed to update MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setMfaLoading(true);
    setMfaError(null);
    try {
      const res = await apiClient.post<{ data: { backupCodes: string[] } }>(
        "/api/auth/mfa/backup-codes"
      );
      setBackupCodes(res.data.backupCodes);
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : "Failed to regenerate codes");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    if (!backupCodes) return;
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        {/* Security */}
        <BlurFade delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage two-factor authentication for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mfaError && (
                <Alert variant="destructive">
                  <AlertDescription>{mfaError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Require a verification code sent to your email on each sign-in
                  </p>
                </div>
                <Switch
                  checked={user?.mfaEnabled ?? false}
                  onCheckedChange={handleMfaToggle}
                  disabled={mfaLoading}
                />
              </div>

              {backupCodes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Backup codes</p>
                    <p className="text-xs text-muted-foreground">
                      Save these codes somewhere safe. Each can only be used once.
                    </p>
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-muted/30 p-4">
                      {backupCodes.map((code, i) => (
                        <code key={i} className="text-sm font-mono text-foreground">
                          {code}
                        </code>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyBackupCodes}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy codes"}
                    </Button>
                  </div>
                </>
              )}

              {user?.mfaEnabled && !backupCodes && (
                <>
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateBackupCodes}
                    disabled={mfaLoading}
                  >
                    Regenerate backup codes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Appearance */}
        <BlurFade delay={0.2}>
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
        <BlurFade delay={0.3}>
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
        <BlurFade delay={0.4}>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </BlurFade>
      </div>
    </PageContainer>
  );
}
