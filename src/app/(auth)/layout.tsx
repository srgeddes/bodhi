import { Logo } from "@/components/Logo";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      <DotPattern
        className={cn(
          "absolute inset-0 -z-10 opacity-[0.04]",
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
