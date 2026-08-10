"use client";

import { Button, Link } from "@heroui/react";
import { ArrowRight } from "@repo/icons";
import {
  AuthLayout,
  type AuthLayoutLabels,
} from "@repo/ui/layout/AuthLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  hasSeenWelcome,
  markWelcomeSeen,
} from "@/modules/app/lib/welcome-storage";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { welcomeScreenVariants } from "./WelcomeScreen.styles";
import type { WelcomeScreenProps } from "./WelcomeScreen.types";

const HERO_SRC = "/auth-hero.jpg";

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
      router.replace("/home");
    }
  }, [activeRole, isAuthenticated, isReady, router]);

  const goSignIn = () => {
    markWelcomeSeen();
    router.replace("/auth");
  };

  const labels: AuthLayoutLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    brandAriaLabel: t("brandAriaLabel"),
    heroAlt: t("heroAlt"),
  };

  return (
    <AuthLayout
      className={className}
      footer={
        <p className={styles.footer()}>
          <span>{t("alreadyHaveAccount")}</span>{" "}
          <Link className={styles.signIn()} onPress={goSignIn}>
            {t("ctaSignIn")}
          </Link>
        </p>
      }
      heroSrc={HERO_SRC}
      labels={labels}
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
