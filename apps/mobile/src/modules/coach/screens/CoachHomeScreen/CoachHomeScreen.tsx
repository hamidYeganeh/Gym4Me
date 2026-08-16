"use client";

import { Typography } from "@heroui/react";
import {
  Calendar1,
  Calendar2,
  CalendarCheck,
  Chat,
  Note1,
  UsersThree,
  Wallet,
} from "@repo/icons";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { mediaFileUrl } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { coachHomeScreenStyles as styles } from "./CoachHomeScreen.styles";

const ICON_SIZE = 22;

export function CoachHomeScreen() {
  const t = useTranslations("CoachHome");
  const router = useRouter();
  const { user } = useAuth();
  const displayName =
    [user?.name.first, user?.name.last].filter(Boolean).join(" ") ||
    user?.phone ||
    t("profileName");

  const setupItems: TodoCardItem[] = [
    {
      id: "profile",
      label: t("todoItemProfile"),
      status: "completed",
    },
    {
      id: "availability",
      label: t("todoItemAvailability"),
      status: "completed",
    },
    {
      id: "verify",
      label: t("todoItemVerify"),
      status: "completed",
    },
    {
      id: "first-program",
      label: t("todoItemFirstProgram"),
      status: "pending",
      onPress: () => router.push("/coach/programs"),
    },
  ];
  const completedCount = setupItems.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <AppLayout
      className={styles.root}
      header={
        <ProfileHeader
          avatarAlt={displayName}
          avatarSrc={mediaFileUrl(user?.avatar.mediaId) ?? undefined}
          bio={t("subtitle")}
          hasNotification
          name={displayName}
          notificationLabel={t("notifications")}
          onNotificationPress={() => router.push("/coach/notifications")}
        />
      }
    >
      <div className={styles.content}>
        <TodoCard
          items={setupItems}
          progressLabel={t("todoProgressLabel")}
          stepLabel={t("todoStepLabel", {
            current: completedCount,
            total: setupItems.length,
          })}
          title={t("todoTitle")}
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
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
