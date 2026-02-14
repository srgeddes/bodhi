"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { useAuthStore } from "@/store/auth.store";

const FIRST_VISIT_KEY = "bodhi_first_visit";

const recurringMessages = [
  "Small steps lead to big financial wins.",
  "Your money, your rules. Let's build your view.",
  "Every dollar has a story. Let's read yours.",
  "The best time to understand your finances was yesterday. The second best is now.",
  "Clarity is the first step to financial confidence.",
  "Think of this as your financial journal.",
  "Let's turn numbers into insights.",
  "Your financial picture, clear and calm.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
    if (isFirstVisit) {
      setMessage("Welcome to Bodhi. Let's get your finances organized.");
      localStorage.setItem(FIRST_VISIT_KEY, "true");
    } else {
      const idx = Math.floor(Math.random() * recurringMessages.length);
      setMessage(recurringMessages[idx]);
    }
  }, []);

  const greeting = getGreeting();
  const name = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <BlurFade delay={0.1}>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
          {greeting}{name ? `, ${name}` : ""}
        </h1>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div className="max-w-md mb-10">
          {message && (
            <TextAnimate
              animation="blurInUp"
              by="word"
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {message}
            </TextAnimate>
          )}
        </div>
      </BlurFade>

      <BlurFade delay={0.3}>
        <Button size="lg" asChild>
          <Link href="/dashboard/accounts">
            Connect Your Accounts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </BlurFade>
    </div>
  );
}
