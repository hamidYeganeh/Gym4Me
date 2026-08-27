"use client";

import { BrandText } from "@repo/ui/kit/LineShadowText";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Ticket } from "@repo/icons/Ticket";
import { Wallet } from "@repo/icons/Wallet";
import { Scan1 } from "@repo/icons/Scan1";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { SpotlightCard } from "@repo/ui/cards/SpotlightCard";
import { stagger, transition } from "@repo/theme";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { AppSectionHeader } from "@repo/ui/layout/AppSectionHeader";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import type { ActionCenterKind } from "@repo/api/action-center";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AthleteHomeMetricsSection } from "@/modules/athlete/sections/AthleteHomeMetricsSection";
import { AthleteHomeSetupTodoSection } from "@/modules/athlete/sections/AthleteHomeSetupTodoSection";
import { AthleteReferralInviteSection } from "@/modules/athlete/sections/AthleteReferralInviteSection";
import { AthleteRoleUpgradeSection } from "@/modules/athlete/sections/AthleteRoleUpgradeSection";
import {
  accountActionCenter,
  mediaFileUrl,
} from "@/shared/lib/api";
import { useRoleNavActions } from "@/shared/components/RoleAppNavigation";
import { useAuth } from "@/shared/providers/AuthProvider";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { athleteHomeScreenStyles as styles } from "./AthleteHomeScreen.styles";

const ICON_SIZE = 22;

type AthleteAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: number;
  kind: ActionCenterKind;
};

const contentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.children,
      delayChildren: stagger.delayChildren,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition },
};

function StaggerSection({ children }: { children: ReactNode }) {
  return <motion.div variants={sectionVariants}>{children}</motion.div>;
}

export function AthleteHomeScreen() {
  const t = useTranslations("AthleteHome");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const { openActions } = useRoleNavActions();
  const firstName = user?.name.first?.trim() ?? "";
  const [actions, setActions] = useState<AthleteAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsError, setActionsError] = useState(false);
  const [actionsStale, setActionsStale] = useState(false);
  const actionsRef = useRef<AthleteAction[]>([]);

  const loadActions = useCallback(async () => {
    if (!user) return;
    setActionsLoading(true);
    setActionsError(false);
    try {
      const result = await accountActionCenter.get();
      setActionsStale(false);
      const nextActions = result.items.map((item) => {
        const due = item.dueAt
          ? new Date(item.dueAt).toLocaleString("fa-IR-u-ca-persian", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Tehran",
            })
          : "";
        const copy =
          item.kind === "athlete.booking_payment"
            ? [t("actionPaymentTitle"), t("actionPaymentBody", item.params)]
            : item.kind === "athlete.workout_resume"
              ? [t("actionWorkoutTitle"), t("actionWorkoutBody")]
              : item.kind === "athlete.waitlist_offer"
                ? [t("actionWaitlistTitle"), t("actionWaitlistBody", { due })]
              : item.kind === "athlete.membership_renew"
                ? [t("actionMembershipTitle"), t("actionMembershipBodyShort")]
                : [t("actionUpcomingTitle"), due];
        return {
          id: item.id,
          title: copy[0],
          description: copy[1],
          href: item.href,
          priority: item.priority,
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

  return (
    <AppLayout
      className={styles.root}
      headerClassName="shadow-none"
      header={
        <ProfileHeader
          avatarAlt={firstName}
          avatarSrc={mediaFileUrl(user?.avatar.mediaId) ?? undefined}
          bio={t("subtitle")}
          hasNotification={DEMO_MODE}
          name={firstName}
          notificationLabel={t("notifications")}
          onNotificationPress={() => router.push("/athlete/notifications")}
        />
      }
    >
      <motion.div
        animate="visible"
        className={styles.content}
        initial={reduceMotion ? false : "hidden"}
        variants={contentVariants}
      >
        {DEMO_MODE ? (
          <StaggerSection>
            <SpotlightCard
              actionAriaLabel={t("heroAction")}
              actionLabel={t("heroAction")}
              description={t("heroDescription")}
              eyebrow={<BrandText />}
              onAction={() => router.push("/athlete/workouts")}
              progress={72}
              progressLabel={t("heroProgressLabel")}
              title={t("heroTitle")}
              unit={t("heroUnit")}
              value={t("heroValue")}
            />
          </StaggerSection>
        ) : null}

        <StaggerSection>
          <AthleteRoleUpgradeSection />
        </StaggerSection>

        <StaggerSection>
          <AthleteHomeSetupTodoSection />
        </StaggerSection>

        <StaggerSection>
          <AthleteHomeMetricsSection />
        </StaggerSection>

        <StaggerSection>
          <section aria-labelledby="athlete-action-center-title" className={styles.section}>
            <AppSectionHeader
              description={t("actionCenterDescription")}
              id="athlete-action-center-title"
              title={t("actionCenterTitle")}
            />
            {actionsLoading ? <p aria-live="polite" className="text-sm text-muted">{t("actionCenterLoading")}</p> : null}
            {actionsError ? (
              <div role="alert">
                <p className="text-sm text-danger">{t(actionsStale ? "actionCenterStale" : "actionCenterError")}</p>
                <button className="mt-2 min-h-11 rounded-medium px-3 text-sm text-primary underline" onClick={() => void loadActions()} type="button">{t("actionCenterRetry")}</button>
              </div>
            ) : null}
            {!actionsLoading && !actionsError && actions.length === 0 ? <p className="text-sm text-muted">{t("actionCenterEmpty")}</p> : null}
            <div className="space-y-3">
              {actions.map((action) => (
                <CallToActionCard
                  actionLabel={t("actionCenterOpen")}
                  actionType="icon"
                  subtitle={action.description}
                  key={action.id}
                  onAction={() => {
                    void accountActionCenter.click({
                      itemId: action.id,
                      kind: action.kind,
                    });
                    router.push(action.href);
                  }}
                  title={action.title}
                  variant={action.priority >= 90 ? "primary" : "outlined"}
                />
              ))}
            </div>
          </section>
        </StaggerSection>

        <StaggerSection>
          <CallToActionCard
            actionLabel={t("bookingsAction")}
            actionType="icon"
            icon={<Calendar1 size={ICON_SIZE} />}
            onAction={() => router.push("/athlete/bookings")}
            subtitle={t("bookingsDescription")}
            title={t("bookingsTitle")}
            variant="outlined"
          />
        </StaggerSection>

        <StaggerSection>
          <section
            aria-labelledby="athlete-quick-links-title"
            className={styles.section}
          >
            <AppSectionHeader
              description={t("quickLinksDescription")}
              id="athlete-quick-links-title"
              title={t("quickLinksTitle")}
            />

            <div className={styles.quickGrid}>
              <QuickActionCard
                icon={<BarbellHorizontal size={ICON_SIZE} />}
                label={t("workoutsTitle")}
                onPress={() => router.push("/athlete/workouts")}
              />
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
              <QuickActionCard
                icon={<Scan1 size={ICON_SIZE} />}
                label={t("checkInsTitle")}
                onPress={() => router.push("/athlete/check-ins")}
              />
              <QuickActionCard
                icon={
                  <span className={styles.moreGlyph} aria-hidden>
                    <span className={styles.moreDot} />
                    <span className={styles.moreDot} />
                    <span className={styles.moreDot} />
                  </span>
                }
                label={t("more")}
                onPress={openActions}
              />
            </div>
          </section>
        </StaggerSection>

        <StaggerSection>
          <AthleteReferralInviteSection />
        </StaggerSection>
      </motion.div>
    </AppLayout>
  );
}
