"use client";

import { Typography } from "@heroui/react/typography";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Calendar2 } from "@repo/icons/Calendar2";
import { CalendarCheck } from "@repo/icons/CalendarCheck";
import { Chat } from "@repo/icons/Chat";
import { Note1 } from "@repo/icons/Note1";
import { UsersThree } from "@repo/icons/UsersThree";
import { Wallet } from "@repo/icons/Wallet";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import type { ActionCenterKind } from "@repo/api/action-center";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  accountActionCenter,
  mediaFileUrl,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { coachHomeScreenStyles as styles } from "./CoachHomeScreen.styles";

const ICON_SIZE = 22;

type CoachAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: ActionCenterKind;
};

export function CoachHomeScreen() {
  const t = useTranslations("CoachHome");
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.name.first?.trim() ?? "";
  const [actions, setActions] = useState<CoachAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsError, setActionsError] = useState(false);
  const [actionsStale, setActionsStale] = useState(false);
  const actionsRef = useRef<CoachAction[]>([]);

  const loadActions = useCallback(async () => {
    if (!user) return;
    setActionsLoading(true);
    setActionsError(false);
    try {
      const result = await accountActionCenter.get();
      setActionsStale(false);
      const nextActions = result.items.map((item) => {
        if (item.kind === "coach.booking_requests") {
          return {
            id: item.id,
            title: t("actionBookingsTitle", item.params),
            description: t("actionBookingsBody"),
            href: item.href,
            kind: item.kind,
          };
        }
        if (item.kind === "coach.student_at_risk") {
          return {
            id: item.id,
            title: t("actionAtRiskTitle", item.params),
            description: t("actionAtRiskBody"),
            href: item.href,
            kind: item.kind,
          };
        }
        return {
          id: item.id,
          title: t("actionProgramTitle"),
          description: t("actionProgramBody"),
          href: item.href,
          kind: item.kind,
        };
      });
      actionsRef.current = nextActions;
      setActions(nextActions);
    } catch {
      setActionsError(true);
      setActionsStale(actionsRef.current.length > 0);
    } finally {
      setActionsLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    void loadActions();
  }, [loadActions]);

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
          avatarAlt={firstName}
          avatarSrc={mediaFileUrl(user?.avatar.mediaId) ?? undefined}
          bio={t("subtitle")}
          hasNotification={DEMO_MODE}
          name={firstName}
          notificationLabel={t("notifications")}
          onNotificationPress={() => router.push("/coach/notifications")}
        />
      }
    >
      <div className={styles.content}>
        {DEMO_MODE ? (
          <TodoCard
            items={setupItems}
            progressLabel={t("todoProgressLabel")}
            stepLabel={t("todoStepLabel", {
              current: completedCount,
              total: setupItems.length,
            })}
            title={t("todoTitle")}
          />
        ) : null}

        <section aria-labelledby="coach-action-center-title" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography id="coach-action-center-title" type="h4" weight="semibold">{t("actionCenterTitle")}</Typography>
            <Typography className={styles.sectionDescription} type="body-sm">{t("actionCenterDescription")}</Typography>
          </div>
          {actionsLoading ? <Typography aria-live="polite" className={styles.sectionDescription} type="body-sm">{t("actionCenterLoading")}</Typography> : null}
          {actionsError ? (
            <div role="alert">
              <Typography className="text-danger" type="body-sm">{t(actionsStale ? "actionCenterStale" : "actionCenterError")}</Typography>
              <button className="mt-2 min-h-11 rounded-medium px-3 text-sm text-primary underline" onClick={() => void loadActions()} type="button">{t("actionCenterRetry")}</button>
            </div>
          ) : null}
          {!actionsLoading && !actionsError && actions.length === 0 ? <Typography className={styles.sectionDescription} type="body-sm">{t("actionCenterEmpty")}</Typography> : null}
          <div className={styles.featureGrid}>
            {actions.map((action) => (
              <CallToActionCard
                actionLabel={t("actionCenterOpen")}
                actionType="icon"
                key={action.id}
                onAction={() => {
                  void accountActionCenter.click({
                    itemId: action.id,
                    kind: action.kind,
                  });
                  router.push(action.href);
                }}
                subtitle={action.description}
                title={action.title}
                variant="outlined"
              />
            ))}
          </div>
        </section>

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
