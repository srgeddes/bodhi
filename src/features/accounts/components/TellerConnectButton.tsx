"use client";

import { useCallback, useState } from "react";
import { useTellerConnect, type TellerConnectEnrollment, type TellerConnectFailure } from "teller-connect-react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";

interface TellerConnectButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "compact";
  institution?: string;
}

export function TellerConnectButton({
  onSuccess,
  variant = "default",
  institution,
}: TellerConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTellerSuccess = useCallback(
    async (authorization: TellerConnectEnrollment) => {
      setIsLoading(true);
      try {
        await apiClient.post("/api/teller/connect", {
          accessToken: authorization.accessToken,
          enrollmentId: authorization.enrollment.id,
          institutionName: authorization.enrollment.institution.name,
        });
        toast.success("Account connected");
        onSuccess?.();
      } catch (error) {
        console.error("Teller connect error:", error);
        toast.error(
          error instanceof ApiClientError
            ? error.message
            : "Failed to connect account. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  const handleTellerFailure = useCallback((failure: TellerConnectFailure) => {
    console.error("Teller Connect failure:", failure);
    toast.error(`Connection failed: ${failure.message}`);
  }, []);

  const handleTellerExit = useCallback(() => {
    console.log("Teller Connect closed");
  }, []);

  const { open, ready } = useTellerConnect({
    applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID ?? "",
    environment: (process.env.NEXT_PUBLIC_TELLER_ENVIRONMENT as "sandbox" | "development" | "production") ?? "sandbox",
    ...(institution ? { institution } : {}),
    onSuccess: handleTellerSuccess,
    onFailure: handleTellerFailure,
    onExit: handleTellerExit,
  });

  const handleClick = () => {
    if (ready) {
      open();
    }
  };

  if (variant === "compact") {
    return (
      <Button size="sm" onClick={handleClick} disabled={!ready || isLoading}>
        <Plus className="h-4 w-4" />
        Connect
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={!ready || isLoading}
      className="w-full border-dashed py-8 text-muted-foreground hover:text-foreground"
    >
      <Building2 className="h-5 w-5" />
      {isLoading ? "Connecting..." : "Connect a bank account"}
    </Button>
  );
}
