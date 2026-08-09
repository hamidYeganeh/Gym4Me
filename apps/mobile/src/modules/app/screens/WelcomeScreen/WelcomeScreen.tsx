"use client";

import { Button, Link, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons";
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

  return (
    <main className={styles.root({ className })}>
      <div aria-hidden className={styles.media()}>
        <img
          alt=""
          className={styles.mediaImage()}
          decoding="async"
          src={HERO_SRC}
        />
        <div className={styles.mediaOverlay()} />
      </div>

      <div className={styles.content()}>
        <div className={styles.copy()}>
          <Typography
            align="center"
            className={styles.title()}
            type="h1"
            weight="bold"
          >
            {t("title")}
          </Typography>
          <Typography
            align="center"
            className={styles.subtitle()}
            color="muted"
            type="body"
          >
            {t("subtitle")}
          </Typography>
        </div>

        <div className={styles.actions()}>
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

          <p className={styles.footer()}>
            <span>{t("alreadyHaveAccount")}</span>
            <Link className={styles.signIn()} onPress={goSignIn}>
              {t("ctaSignIn")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
