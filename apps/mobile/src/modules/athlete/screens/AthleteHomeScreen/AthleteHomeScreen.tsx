"use client";

import { Typography } from "@heroui/react";
import { ChartBar2, HeartEcg, House1, User } from "@repo/icons";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { Logo } from "@repo/ui/common/Logo";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { BottomNav } from "@repo/ui/layout/BottomNav";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import { ProfileStats } from "@repo/ui/layout/ProfileStats";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { athleteHomeScreenStyles as styles } from "./AthleteHomeScreen.styles";

const ICON_SIZE = 22;

export function AthleteHomeScreen() {
  const t = useTranslations("AthleteHome");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      footer={
        <BottomNav
          aria-label={t("navLabel")}
          centerAction={{
            label: t("create"),
            icon: (
              <Logo
                color="var(--accent-foreground)"
                gradient={false}
                shadow={false}
                size={48}
              />
            ),
            actionsLabel: t("actionsLabel"),
            actions: [
              {
                key: "metrics",
                label: t("metrics"),
                icon: <ChartBar2 size={ICON_SIZE} />,
              },
              {
                key: "activity",
                label: t("activity"),
                icon: <HeartEcg size={ICON_SIZE} />,
              },
            ],
          }}
          items={[
            {
              key: "home",
              label: t("home"),
              icon: <House1 size={ICON_SIZE} />,
              href: "/athlete",
              isActive: true,
            },
            {
              key: "metrics",
              label: t("metrics"),
              icon: <ChartBar2 size={ICON_SIZE} />,
              href: "/athlete/metrics",
            },
            {
              key: "activity",
              label: t("activity"),
              icon: <HeartEcg size={ICON_SIZE} />,
            },
            {
              key: "profile",
              label: t("profile"),
              icon: <User size={ICON_SIZE} />,
            },
          ]}
        />
      }
      header={
        <ProfileHeader
          avatarAlt={t("profileName")}
          avatarSrc="/demo/coach-portrait.png"
          bio={t("profileBio")}
          hasNotification
          name={t("profileName")}
          notificationLabel={t("notifications")}
        />
      }
    >
      <div className={styles.content}>
        <ProfileStats
          stats={[
            {
              key: "followers",
              label: t("statFollowers"),
              value: t("statFollowersValue"),
              avatars: [
                "/demo/coach-portrait.png",
                "/demo/coach-portrait.png",
                "/demo/coach-portrait.png",
              ],
            },
            {
              key: "views",
              label: t("statViews"),
              value: t("statViewsValue"),
              actionLabel: t("statViewsAction"),
              onActionPress: () => undefined,
            },
          ]}
        />

        <Typography color="muted" type="body">
          {t("subtitle")}
        </Typography>

        <Typography className={styles.title} type="h4" weight="semibold">
          {t("quickLinksTitle")}
        </Typography>

        <div className={styles.links}>
          <CallToActionCard
            actionLabel={t("metricsAction")}
            actionType="plus"
            onAction={() => router.push("/athlete/metrics")}
            subtitle={t("metricsDescription")}
            title={t("metricsTitle")}
            variant="primary"
          />
        </div>
      </div>
    </AppLayout>
  );
}
