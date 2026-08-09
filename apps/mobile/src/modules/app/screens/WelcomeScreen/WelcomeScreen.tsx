"use client";

import { Button, Typography } from "@heroui/react";
import { Building2 } from "@repo/icons/Building2";
import { Calendar1 } from "@repo/icons/Calendar1";
import { MapTrifold } from "@repo/icons/MapTrifold";
import { Logo } from "@repo/ui/common/Logo";
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

  const finishWelcome = (href: string) => {
    markWelcomeSeen();
    router.replace(href);
  };

  const features = [
    {
      key: "discover",
      icon: <MapTrifold aria-hidden size={20} />,
      title: t("featureDiscoverTitle"),
      body: t("featureDiscoverBody"),
    },
    {
      key: "clubs",
      icon: <Building2 aria-hidden size={20} />,
      title: t("featureClubsTitle"),
      body: t("featureClubsBody"),
    },
    {
      key: "book",
      icon: <Calendar1 aria-hidden size={20} />,
      title: t("featureBookTitle"),
      body: t("featureBookBody"),
    },
  ] as const;

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
        <div className={styles.brand()}>
          <div className={styles.brandRow()}>
            <Logo size="lg" title={t("brandAriaLabel")} />
            <span className={styles.brandName()}>{t("brand")}</span>
          </div>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </div>

        <ul className={styles.features()}>
          {features.map((feature) => (
            <li className={styles.feature()} key={feature.key}>
              <span className={styles.featureIcon()}>{feature.icon}</span>
              <div className={styles.featureCopy()}>
                <Typography
                  className={styles.featureTitle()}
                  type="body-sm"
                  weight="semibold"
                >
                  {feature.title}
                </Typography>
                <Typography className={styles.featureBody()} type="body-xs">
                  {feature.body}
                </Typography>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.actions()}>
          <Button
            className={styles.primary()}
            onPress={() => finishWelcome("/home")}
            size="lg"
            variant="primary"
          >
            {t("ctaExplore")}
          </Button>
          <Button
            className={styles.secondary()}
            onPress={() => finishWelcome("/auth")}
            size="lg"
            variant="secondary"
          >
            {t("ctaSignIn")}
          </Button>
        </div>
      </div>
    </main>
  );
}
