"use client";

import { Typography } from "@heroui/react";
import {
  Calendar1,
  ChartBar2,
  HeartEcg,
  House1,
  Ticket,
  User,
  Wallet,
  Scan1,
  BarbellHorizontal,
  Gift,
  Leaf,
  UsersTwo,
} from "@repo/icons";
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

        <section
          aria-labelledby="athlete-overview-title"
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <Typography
              className={styles.title}
              id="athlete-overview-title"
              type="h4"
              weight="semibold"
            >
              {t("overviewTitle")}
            </Typography>
            <Typography className={styles.sectionDescription} type="body-sm">
              {t("overviewDescription")}
            </Typography>
          </div>

          <div className={styles.featureGrid}>
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
        </section>

        <section
          aria-labelledby="athlete-quick-links-title"
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <Typography
              className={styles.title}
              id="athlete-quick-links-title"
              type="h4"
              weight="semibold"
            >
              {t("quickLinksTitle")}
            </Typography>
            <Typography className={styles.sectionDescription} type="body-sm">
              {t("quickLinksDescription")}
            </Typography>
          </div>

          <div className={styles.quickGrid}>
            <QuickActionCard
              icon={<Calendar1 size={ICON_SIZE} />}
              label={t("bookingsTitle")}
              layout="row"
              onPress={() => router.push("/athlete/bookings")}
            />
            <QuickActionCard
              icon={<Wallet size={ICON_SIZE} />}
              label={t("walletTitle")}
              layout="row"
              onPress={() => router.push("/athlete/wallet")}
            />
            <QuickActionCard
              icon={<Ticket size={ICON_SIZE} />}
              label={t("membershipsTitle")}
              layout="row"
              onPress={() => router.push("/athlete/memberships")}
            />
            <QuickActionCard
              icon={<Scan1 size={ICON_SIZE} />}
              label={t("checkInsTitle")}
              layout="row"
              onPress={() => router.push("/athlete/check-ins")}
            />
            <QuickActionCard
              icon={<BarbellHorizontal size={ICON_SIZE} />}
              label={t("workoutsTitle")}
              layout="row"
              onPress={() => router.push("/athlete/workouts")}
            />
            <QuickActionCard
              icon={<Gift size={ICON_SIZE} />}
              label={t("referralTitle")}
              layout="row"
              onPress={() => router.push("/athlete/referral")}
            />
            <QuickActionCard
              icon={<UsersTwo size={ICON_SIZE} />}
              label={t("socialTitle")}
              layout="row"
              onPress={() => router.push("/athlete/social")}
            />
            <QuickActionCard
              icon={<Leaf size={ICON_SIZE} />}
              label={t("nutritionTitle")}
              layout="row"
              onPress={() => router.push("/athlete/nutrition")}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
