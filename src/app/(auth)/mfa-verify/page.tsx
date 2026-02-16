"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function MfaVerifyPage() {
  const router = useRouter();
  const { verifyMfa, mfaPending, isLoading, error, clearError } = useAuthStore();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no MFA session
  useEffect(() => {
    if (!mfaPending) {
      router.replace("/login");
    }
  }, [mfaPending, router]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      handleSubmitCode(fullCode);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      handleSubmitCode(pasted);
    }
  };

  const handleSubmitCode = async (codeValue: string) => {
    clearError();
    try {
      await verifyMfa(codeValue);
      router.replace("/dashboard");
    } catch {
      // Error handled by store
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await verifyMfa(code);
      router.replace("/dashboard");
    } catch {
      // Error handled by store
    }
  };

  if (!mfaPending) return null;

  return (
    <BlurFade>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>
            <TextAnimate animation="blurIn" by="word" className="text-xl font-semibold">
              {useBackupCode ? "Enter backup code" : "Enter verification code"}
            </TextAnimate>
          </CardTitle>
          <CardDescription>
            {useBackupCode
              ? "Enter one of your 8-character backup codes"
              : "We sent a 6-digit code to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {useBackupCode ? (
            <form onSubmit={handleBackupSubmit} className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter backup code"
                maxLength={8}
                className="text-center font-mono text-lg tracking-widest"
                autoFocus
              />
              <Button type="submit" disabled={isLoading || code.length < 8} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </form>
          ) : (
            <div className="flex justify-center gap-2" onPaste={handleDigitPaste}>
              {digits.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                  autoFocus={i === 0}
                  className="h-12 w-12 text-center font-mono text-xl"
                  disabled={isLoading}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                clearError();
                setCode("");
                setDigits(["", "", "", "", "", ""]);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {useBackupCode ? "Use email code instead" : "Use a backup code"}
            </button>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </BlurFade>
  );
}
