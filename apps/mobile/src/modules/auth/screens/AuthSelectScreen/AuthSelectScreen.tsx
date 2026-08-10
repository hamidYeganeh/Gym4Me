"use client";

import { useEffect, useState } from "react";
import { Button, Link } from "@heroui/react";
import { ApiError } from "@repo/api";
import { BiometricFrame, FaceId, Lock1, Telephone1 } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { hasLoggedInBefore } from "@/modules/auth/lib/biometric-unlock";
import {
  authenticateBiometric,
  checkBiometricAvailability,
} from "@/shared/lib/biometric";
import { withAuthNext } from "@/shared/lib/auth-redirect";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { authSelectScreenVariants } from "./AuthSelectScreen.styles";
import type { AuthSelectScreenProps } from "./AuthSelectScreen.types";

const HERO_SRC = "/auth-hero.jpg";

export function AuthSelectScreen({ className }: AuthSelectScreenProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = authSelectScreenVariants();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { loginWithBiometricUnlock } = useAuth();

  const [showBiometric, setShowBiometric] = useState(false);
  const [isBiometricPending, setIsBiometricPending] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      if (!hasLoggedInBefore()) {
        if (!cancelled) setShowBiometric(false);
        return;
      }
      const availability = await checkBiometricAvailability();
      if (!cancelled) {
        setShowBiometric(availability.isAvailable && hasLoggedInBefore());
      }
    };
    void resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  const labels: AuthLayoutLabels = {
    title: t("selectTitle"),
    subtitle: t("selectSubtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  const handleBiometric = async () => {
    setBiometricError(null);
    setIsBiometricPending(true);
    try {
      const result = await authenticateBiometric({
        reason: t("biometricReason"),
        cancel: t("biometricCancel"),
        androidTitle: t("biometricAndroidTitle"),
        androidSubtitle: t("biometricAndroidSubtitle"),
      });

      if (!result.ok) {
        if (result.reason === "cancel") return;
        setBiometricError(
          result.reason === "unavailable"
            ? t("biometricUnavailable")
            : t("biometricFailed"),
        );
        return;
      }

      const session = await loginWithBiometricUnlock();
      router.replace(
        next && next.startsWith("/")
          ? next
          : roleHomePath(session.activeRole),
      );
    } catch (error) {
      setBiometricError(
        error instanceof ApiError
          ? t("biometricUnlockExpired")
          : t("biometricFailed"),
      );
      setShowBiometric(false);
    } finally {
      setIsBiometricPending(false);
    }
  };

  return (
    <AuthLayout
      className={className}
      footer={
        <p className={styles.footer()}>
          {t("noAccount")}{" "}
          <Link
            className={styles.footerLink()}
            onPress={() => router.push(withAuthNext("/auth/otp", next))}
          >
            {t("signUp")}
          </Link>
        </p>
      }
      heroSrc={HERO_SRC}
      labels={labels}
    >
      <div className={styles.actions()}>
        {showBiometric ? (
          <div className={styles.biometric()}>
            <BiometricFrame
              aria-hidden
              className={styles.biometricFrame()}
              size={140}
            />
            <Button
              className={styles.biometricButton()}
              fullWidth
              isPending={isBiometricPending}
              size="lg"
              variant="secondary"
              onPress={() => void handleBiometric()}
            >
              <FaceId aria-hidden className={styles.biometricIcon()} size={20} />
              {t("continueWithBiometric")}
            </Button>
            {biometricError ? (
              <p className={styles.biometricError()} role="alert">
                {biometricError}
              </p>
            ) : null}
          </div>
        ) : null}

        <Button
          className={`${styles.method()} ${styles.methodLogin()}`}
          fullWidth
          size="lg"
          variant="secondary"
          onPress={() => router.push(withAuthNext("/auth/login", next))}
        >
          <Lock1 aria-hidden className={styles.methodIcon()} size={20} />
          {t("continueWithLogin")}
        </Button>

        <Button
          className={`${styles.method()} ${styles.methodOtp()}`}
          fullWidth
          size="lg"
          variant="primary"
          onPress={() => router.push(withAuthNext("/auth/otp", next))}
        >
          <Telephone1 aria-hidden className={styles.methodIcon()} size={20} />
          {t("continueWithOtp")}
        </Button>
      </div>
    </AuthLayout>
  );
}
