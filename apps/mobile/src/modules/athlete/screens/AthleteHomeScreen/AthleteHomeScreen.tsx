"use client";

import { Typography } from "@heroui/react";
import {
  Calendar1,
  Chat,
  Ticket,
  Wallet,
  Scan1,
  BarbellHorizontal,
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
import { athleteHomeScreenStyles as styles } from "./AthleteHomeScreen.styles";

const ICON_SIZE = 22;

export function AthleteHomeScreen() {
  const t = useTranslations("AthleteHome");
  const router = useRouter();
  const { user } = useAuth();
  const displayName =
    [user?.name.first, user?.name.last].filter(Boolean).join(" ") ||
    user?.phone ||
    t("profileName");

  const setupItems: TodoCardItem[] = [
    {
      id: "assessment",
      label: t("todoItemAssessment"),
      status: "completed",
    },
    {
      id: "profile",
      label: t("todoItemProfile"),
      status: "completed",
    },
    {
      id: "verify",
      label: t("todoItemVerify"),
      status: "completed",
    },
    {
      id: "first-exercise",
      label: t("todoItemFirstExercise"),
      status: "pending",
      onPress: () => router.push("/athlete/workouts"),
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
          onNotificationPress={() => router.push("/athlete/notifications")}
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
              icon={<Chat size={ICON_SIZE} />}
              label={t("messagesTitle")}
              layout="row"
              onPress={() => router.push("/athlete/messages")}
            />
            <QuickActionCard
              icon={<BarbellHorizontal size={ICON_SIZE} />}
              label={t("workoutsTitle")}
              layout="row"
              onPress={() => router.push("/athlete/workouts")}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
