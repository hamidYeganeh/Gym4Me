"use client";

import { Button } from "@heroui/react/button";
import { FaceId } from "@repo/icons/FaceId";
import { useState } from "react";
import { authenticateBiometric } from "@/shared/lib/biometric";

export type BiometricAuthButtonLabels = {
  action: string;
  reason: string;
  cancel: string;
  androidTitle: string;
  androidSubtitle: string;
  success: string;
  unavailable: string;
  failed: string;
};

type AuthStatus = "idle" | "success" | "unavailable" | "failed";

export function BiometricAuthButton({
  labels,
}: {
  labels: BiometricAuthButtonLabels;
}) {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const statusMessage =
    status === "success"
      ? labels.success
      : status === "unavailable"
        ? labels.unavailable
        : status === "failed"
          ? labels.failed
          : null;

  async function handleAuthenticate() {
    setIsAuthenticating(true);
    setStatus("idle");

    const result = await authenticateBiometric({
      reason: labels.reason,
      cancel: labels.cancel,
      androidTitle: labels.androidTitle,
      androidSubtitle: labels.androidSubtitle,
    });

    if (result.ok) {
      setStatus("success");
    } else if (result.reason !== "cancel") {
      setStatus(result.reason);
    }

    setIsAuthenticating(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg"
        variant="primary"
        className="w-fit gap-2"
        isDisabled={isAuthenticating}
        onPress={() => {
          void handleAuthenticate();
        }}
      >
        <FaceId size={18} />
        {labels.action}
      </Button>
      {statusMessage ? (
        <p
          className={
            status === "success"
              ? "text-sm text-success"
              : "text-sm text-danger"
          }
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
