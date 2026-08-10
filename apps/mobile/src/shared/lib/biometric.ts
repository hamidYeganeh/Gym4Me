export type BiometricAvailability = {
  isAvailable: boolean;
  biometryType: string | null;
};

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const { BiometricAuth, BiometryType } = await import(
      "@aparajita/capacitor-biometric-auth"
    );
    const { Capacitor } = await import("@capacitor/core");

    // Web plugin starts with no biometry; enable Face ID simulation for local demos.
    if (!Capacitor.isNativePlatform()) {
      await BiometricAuth.setBiometryType(BiometryType.faceId);
      await BiometricAuth.setBiometryIsEnrolled(true);
      await BiometricAuth.setDeviceIsSecure(true);
    }

    const availability = await BiometricAuth.checkBiometry();
    const isAvailable = Boolean(
      availability.isAvailable ||
        (!Capacitor.isNativePlatform() && availability.deviceIsSecure),
    );

    return {
      isAvailable,
      biometryType: availability.biometryType
        ? String(availability.biometryType)
        : null,
    };
  } catch {
    return { isAvailable: false, biometryType: null };
  }
}

export type AuthenticateBiometricLabels = {
  reason: string;
  cancel: string;
  androidTitle: string;
  androidSubtitle: string;
};

export type AuthenticateBiometricResult =
  | { ok: true }
  | { ok: false; reason: "cancel" | "unavailable" | "failed" };

export async function authenticateBiometric(
  labels: AuthenticateBiometricLabels,
): Promise<AuthenticateBiometricResult> {
  try {
    const { AndroidBiometryStrength, BiometricAuth, BiometryType } =
      await import("@aparajita/capacitor-biometric-auth");
    const { Capacitor } = await import("@capacitor/core");

    if (!Capacitor.isNativePlatform()) {
      await BiometricAuth.setBiometryType(BiometryType.faceId);
      await BiometricAuth.setBiometryIsEnrolled(true);
      await BiometricAuth.setDeviceIsSecure(true);
    }

    const availability = await BiometricAuth.checkBiometry();
    if (!availability.isAvailable && Capacitor.isNativePlatform()) {
      return { ok: false, reason: "unavailable" };
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

    return { ok: true };
  } catch (error) {
    const code = getErrorCode(error);
    if (
      code === "userCancel" ||
      code === "systemCancel" ||
      code === "appCancel"
    ) {
      return { ok: false, reason: "cancel" };
    }
    const unavailable =
      code === "biometryNotAvailable" ||
      code === "biometryNotEnrolled" ||
      code === "noDeviceCredential" ||
      code === "passcodeNotSet";
    return { ok: false, reason: unavailable ? "unavailable" : "failed" };
  }
}
