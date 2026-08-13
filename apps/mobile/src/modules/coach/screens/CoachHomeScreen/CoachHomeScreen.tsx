"use client";

import { Typography } from "@heroui/react";
import {
  Calendar1,
  Calendar2,
  CalendarCheck,
  ChartTrendUp,
  Chat,
  House1,
  Note1,
  User,
  UsersThree,
  Wallet,
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
import { coachHomeScreenStyles as styles } from "./CoachHomeScreen.styles";

const ICON_SIZE = 22;

export function CoachHomeScreen() {
  const t = useTranslations("CoachHome");
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
                key: "daily",
                label: t("dailyPlan"),
                icon: <Calendar1 size={ICON_SIZE} />,
                href: "/coach/calendar/daily",
              },
              {
                key: "weekly",
                label: t("weeklyPlan"),
                icon: <Calendar2 size={ICON_SIZE} />,
                href: "/coach/calendar/weekly",
              },
              {
                key: "clients",
                label: t("clients"),
                icon: <UsersThree size={ICON_SIZE} />,
                href: "/coach/clients",
              },
            ],
          }}
          items={[
            {
              key: "home",
              label: t("home"),
              icon: <House1 size={ICON_SIZE} />,
              href: "/coach",
              isActive: true,
            },
            {
              key: "calendar",
              label: t("calendar"),
              icon: <Calendar1 size={ICON_SIZE} />,
              href: "/coach/calendar/daily",
            },
            {
              key: "clients",
              label: t("clients"),
              icon: <UsersThree size={ICON_SIZE} />,
              href: "/coach/clients",
            },
            {
              key: "profile",
              label: t("profile"),
              icon: <User size={ICON_SIZE} />,
              href: "/coach/profile",
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
          onNotificationPress={() => router.push("/coach/notifications")}
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
          aria-labelledby="coach-overview-title"
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <Typography
              className={styles.title}
              id="coach-overview-title"
              type="h4"
              weight="semibold"
            >
              {t("overviewTitle")}
            </Typography>
            <Typography className={styles.sectionDescription} type="body-sm">
              {t("subtitle")}
            </Typography>
          </div>

          <div className={styles.featureGrid}>
            <CallToActionCard
              actionLabel={t("dailyPlan")}
              actionType="plus"
              onAction={() => router.push("/coach/calendar/daily")}
              subtitle={t("dailyPlanDescription")}
              title={t("dailyPlan")}
              variant="primary"
            />
            <CallToActionCard
              actionLabel={t("weeklyPlan")}
              actionType="icon"
              icon={<Calendar2 size={ICON_SIZE} />}
              onAction={() => router.push("/coach/calendar/weekly")}
              subtitle={t("weeklyPlanDescription")}
              title={t("weeklyPlan")}
              variant="outlined"
            />
          </div>
        </section>

        <section
          aria-labelledby="coach-quick-links-title"
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <Typography
              className={styles.title}
              id="coach-quick-links-title"
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
              icon={<UsersThree size={ICON_SIZE} />}
              label={t("clientsLink")}
              layout="row"
              onPress={() => router.push("/coach/clients")}
            />
            <QuickActionCard
              icon={<CalendarCheck size={ICON_SIZE} />}
              label={t("bookingsLink")}
              layout="row"
              onPress={() => router.push("/coach/bookings")}
            />
            <QuickActionCard
              icon={<Calendar1 size={ICON_SIZE} />}
              label={t("slotsLink")}
              layout="row"
              onPress={() => router.push("/coach/slots")}
            />
            <QuickActionCard
              icon={<Note1 size={ICON_SIZE} />}
              label={t("programsLink")}
              layout="row"
              onPress={() => router.push("/coach/programs")}
            />
            <QuickActionCard
              icon={<Wallet size={ICON_SIZE} />}
              label={t("earningsLink")}
              layout="row"
              onPress={() => router.push("/coach/earnings")}
            />
            <QuickActionCard
              icon={<Chat size={ICON_SIZE} />}
              label={t("messagesLink")}
              layout="row"
              onPress={() => router.push("/coach/messages")}
            />
            <QuickActionCard
              icon={<ChartTrendUp size={ICON_SIZE} />}
              label={t("analyticsLink")}
              layout="row"
              onPress={() => router.push("/coach/analytics")}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
