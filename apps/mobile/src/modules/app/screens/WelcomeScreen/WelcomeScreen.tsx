"use client";

import { Button } from "@heroui/react/button";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { AuthLayout, type AuthLayoutLabels } from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useEffect } from "react";
import {
  hasSeenWelcome,
  markWelcomeSeen,
} from "@/modules/app/lib/welcome-storage";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { welcomeScreenVariants } from "./WelcomeScreen.styles";
import type { WelcomeScreenProps } from "./WelcomeScreen.types";

const HERO_SRC = "/welcome/hero-athletes.png";

export function WelcomeScreen({ className }: WelcomeScreenProps) {
  const t = useTranslations("Mobile.Welcome");
  const styles = welcomeScreenVariants();
  const router = useRouter();
  const { isAuthenticated, activeRole, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace(roleHomePath(activeRole));
      return;
    }
    if (hasSeenWelcome()) {
      router.replace("/discovery");
    }
  }, [activeRole, isAuthenticated, isReady, router]);

  const goSignIn = () => {
    markWelcomeSeen();
    router.replace("/auth/otp");
  };

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  return (
    <AuthLayout
      animateCopy
      className={className}
      footer={
        <Button onPress={goSignIn} variant="ghost" size="lg">
          <span>{t("alreadyHaveAccount")}</span>{" "}
          <span className={styles.signIn()}>{t("ctaSignIn")}</span>
        </Button>
      }
      heroSrc={HERO_SRC}
      labels={labels}
      showBrand={false}
      tone="hero"
    >
      <Button
        className={styles.primary()}
        fullWidth
        onPress={() => router.push("/welcome/introduce")}
        size="lg"
        variant="primary"
      >
        {t("ctaGetStarted")}
        <ArrowRight aria-hidden className={styles.primaryIcon()} size={20} />
      </Button>
    </AuthLayout>
  );
}
