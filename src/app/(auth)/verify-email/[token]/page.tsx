"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function VerifyEmailTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!params.token) return;

    let cancelled = false;

    async function verify() {
      try {
        await verifyEmail(params.token);
        if (!cancelled) {
          setStatus("success");
          setTimeout(() => router.replace("/dashboard"), 2000);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Verification failed");
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [params.token, verifyEmail, router]);

  return (
    <BlurFade>
      <Card>
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Verifying your email...</CardTitle>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <CardTitle className="text-xl font-semibold">Email verified</CardTitle>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="text-xl font-semibold">Verification failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/verify-email">Resend link</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Back to login</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </BlurFade>
  );
}
