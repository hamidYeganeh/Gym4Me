"use client";

import { Typography } from "@heroui/react";
import { Calendar1, ChartBar2, HeartEcg, House1, Ticket, User, Wallet } from "@repo/icons";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
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
                href: "/athlete/metrics",
              },
              {
                key: "activity",
                label: t("activity"),
                icon: <HeartEcg size={ICON_SIZE} />,
                href: "/athlete/bookings",
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
              href: "/athlete/bookings",
            },
            {
              key: "profile",
              label: t("profile"),
              icon: <User size={ICON_SIZE} />,
              href: "/athlete/profile",
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
          onNotificationPress={() => router.push("/athlete/notifications")}
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
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Calendar1 size={ICON_SIZE} />}
              label={t("bookingsTitle")}
              onPress={() => router.push("/athlete/bookings")}
            />
            <QuickActionCard
              icon={<Wallet size={ICON_SIZE} />}
              label={t("walletTitle")}
              onPress={() => router.push("/athlete/wallet")}
            />
            <QuickActionCard
              icon={<Ticket size={ICON_SIZE} />}
              label={t("membershipsTitle")}
              onPress={() => router.push("/athlete/memberships")}
            />
          </div>
          <CallToActionCard
            actionLabel={t("metricsAction")}
            actionType="plus"
            onAction={() => router.push("/athlete/metrics")}
            subtitle={t("metricsDescription")}
            title={t("metricsTitle")}
            variant="primary"
          />
          <CallToActionCard
            actionLabel={t("bookingsAction")}
            actionType="icon"
            icon={<Calendar1 size={ICON_SIZE} />}
            onAction={() => router.push("/athlete/bookings")}
            subtitle={t("bookingsDescription")}
            title={t("bookingsTitle")}
            variant="outlined"
          />
        </div>
      </div>
    </AppLayout>
  );
}
