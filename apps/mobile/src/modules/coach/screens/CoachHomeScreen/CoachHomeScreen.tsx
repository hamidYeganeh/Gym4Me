"use client";

import { Typography } from "@heroui/react";
import {
  Calendar1,
  Calendar2,
  CalendarCheck,
  ChartTrendUp,
  House1,
  Note1,
  User,
  UsersThree,
  Wallet,
} from "@repo/icons";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
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

        <Typography color="muted" type="body">
          {t("subtitle")}
        </Typography>

        <Typography className={styles.title} type="h4" weight="semibold">
          {t("quickLinksTitle")}
        </Typography>

        <div className={styles.links}>
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
            icon={<Calendar2 size={28} />}
            onAction={() => router.push("/coach/calendar/weekly")}
            subtitle={t("weeklyPlanDescription")}
            title={t("weeklyPlan")}
            variant="outlined"
          />
          <CallToActionCard
            actionLabel={t("clientsLink")}
            actionType="icon"
            icon={<UsersThree size={28} />}
            onAction={() => router.push("/coach/clients")}
            subtitle={t("clientsLinkDescription")}
            title={t("clientsLink")}
            variant="outlined"
          />
          <CallToActionCard
            actionLabel={t("bookingsLink")}
            actionType="icon"
            icon={<CalendarCheck size={28} />}
            onAction={() => router.push("/coach/bookings")}
            subtitle={t("bookingsLinkDescription")}
            title={t("bookingsLink")}
            variant="outlined"
          />
          <CallToActionCard
            actionLabel={t("slotsLink")}
            actionType="icon"
            icon={<Calendar1 size={28} />}
            onAction={() => router.push("/coach/slots")}
            subtitle={t("slotsLinkDescription")}
            title={t("slotsLink")}
            variant="outlined"
          />
          <CallToActionCard
            actionLabel={t("programsLink")}
            actionType="icon"
            icon={<Note1 size={28} />}
            onAction={() => router.push("/coach/programs")}
            subtitle={t("programsLinkDescription")}
            title={t("programsLink")}
            variant="outlined"
          />
          <CallToActionCard
            actionLabel={t("earningsLink")}
            actionType="icon"
            icon={<Wallet size={28} />}
            onAction={() => router.push("/coach/earnings")}
            subtitle={t("earningsLinkDescription")}
            title={t("earningsLink")}
            variant="outlined"
          />
          <CallToActionCard
            actionLabel={t("analyticsLink")}
            actionType="icon"
            icon={<ChartTrendUp size={28} />}
            onAction={() => router.push("/coach/analytics")}
            subtitle={t("analyticsLinkDescription")}
            title={t("analyticsLink")}
            variant="outlined"
          />
        </div>
      </div>
    </AppLayout>
  );
}
