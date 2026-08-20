"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react/button";
import { ApiError } from "@repo/api";
import { BiometricFrame } from "@repo/icons/BiometricFrame";
import { FingerprintScan } from "@repo/icons/FingerprintScan";
import { Lock1 } from "@repo/icons/Lock1";
import { Telephone1 } from "@repo/icons/Telephone1";
import { toast } from "@repo/ui/kit/Toast";
import { AuthLayout, type AuthLayoutLabels } from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
import { useRouter } from "@/shared/lib/app-router";

const HERO_SRC = "/auth-hero.jpg";

export function AuthSelectScreen({ className }: AuthSelectScreenProps) {
  const t = useTranslations("Mobile.Auth");
  const styles = authSelectScreenVariants();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { loginWithBiometricUnlock } = useAuth();

  const [showBiometric, setShowBiometric] = useState(true);
  const [isBiometricPending, setIsBiometricPending] = useState(false);

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
        toast.error(t("toastErrorTitle"), {
          description:
            result.reason === "unavailable"
              ? t("biometricUnavailable")
              : t("biometricFailed"),
        });
        return;
      }

      const session = await loginWithBiometricUnlock();
      router.replace(
        next && next.startsWith("/") ? next : roleHomePath(session.activeRole),
      );
    } catch (error) {
      toast.error(t("toastErrorTitle"), {
        description:
          error instanceof ApiError
            ? t("biometricUnlockExpired")
            : t("biometricFailed"),
      });
      setShowBiometric(false);
    } finally {
      setIsBiometricPending(false);
    }
  };

  return (
    <AuthLayout className={className} heroSrc={HERO_SRC} labels={labels}>
      <div className={styles.actions()}>
        {showBiometric ? (
          <div className={styles.biometric()}>
            <Button
              aria-label={t("continueWithBiometric")}
              className={styles.biometricButton()}
              isIconOnly
              isPending={isBiometricPending}
              size="lg"
              variant="ghost"
              onPress={() => void handleBiometric()}
            >
              <span aria-hidden className={styles.biometricMark()}>
                <BiometricFrame
                  className={styles.biometricFrame()}
                  size={160}
                />
                <FingerprintScan
                  className={styles.biometricGlyph()}
                  height={140}
                  width={112}
                />
              </span>
            </Button>
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
