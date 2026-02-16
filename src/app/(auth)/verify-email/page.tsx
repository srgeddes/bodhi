"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const { verificationEmail, resendVerification, isLoading, error } = useAuthStore();
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    try {
      await resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      // error handled by store
    }
  };

  return (
    <BlurFade>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>
            <TextAnimate animation="blurIn" by="word" className="text-xl font-semibold">
              Check your email
            </TextAnimate>
          </CardTitle>
          <CardDescription>
            {verificationEmail
              ? `We sent a verification link to ${verificationEmail}`
              : "We sent a verification link to your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resent && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Verification email resent.</AlertDescription>
            </Alert>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Click the link in your email to verify your account. The link expires in 24 hours.
          </p>

          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isLoading || resent}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {resent ? "Email sent" : "Resend verification email"}
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              Sign up again
            </Link>
          </p>
        </CardFooter>
      </Card>
    </BlurFade>
  );
}
