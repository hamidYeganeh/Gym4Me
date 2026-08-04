"use client";

import { Button } from "@heroui/react";
import { FaceId } from "@repo/icons";
import { useState } from "react";

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

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

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

    try {
      const { AndroidBiometryStrength, BiometricAuth, BiometryType } =
        await import("@aparajita/capacitor-biometric-auth");
      const { Capacitor } = await import("@capacitor/core");

      // Web plugin starts with no biometry; enable a Face ID simulation for local demos.
      if (!Capacitor.isNativePlatform()) {
        await BiometricAuth.setBiometryType(BiometryType.faceId);
        await BiometricAuth.setBiometryIsEnrolled(true);
        await BiometricAuth.setDeviceIsSecure(true);
      }

      const availability = await BiometricAuth.checkBiometry();
      if (!availability.isAvailable && !availability.deviceIsSecure) {
        setStatus("unavailable");
        return;
      }

      await BiometricAuth.authenticate({
        reason: labels.reason,
        cancelTitle: labels.cancel,
        allowDeviceCredential: true,
        androidTitle: labels.androidTitle,
        androidSubtitle: labels.androidSubtitle,
        androidConfirmationRequired: false,
        androidBiometryStrength: AndroidBiometryStrength.weak,
      });

      setStatus("success");
    } catch (error) {
      const code = getErrorCode(error);

      if (
        code === "userCancel" ||
        code === "systemCancel" ||
        code === "appCancel"
      ) {
        return;
      }

      const unavailable =
        code === "biometryNotAvailable" ||
        code === "biometryNotEnrolled" ||
        code === "noDeviceCredential" ||
        code === "passcodeNotSet";

      setStatus(unavailable ? "unavailable" : "failed");
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
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
