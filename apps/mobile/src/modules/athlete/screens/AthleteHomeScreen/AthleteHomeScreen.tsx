"use client";

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
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { ReactNode } from "react";
import { AthleteHomeMetricsSection } from "@/modules/athlete/sections/AthleteHomeMetricsSection";
import { AthleteHomeSetupTodoSection } from "@/modules/athlete/sections/AthleteHomeSetupTodoSection";
import { AthleteReferralInviteSection } from "@/modules/athlete/sections/AthleteReferralInviteSection";
import { AthleteRoleUpgradeSection } from "@/modules/athlete/sections/AthleteRoleUpgradeSection";
import { mediaFileUrl } from "@/shared/lib/api";
import { useRoleNavActions } from "@/shared/components/RoleAppNavigation";
import { useAuth } from "@/shared/providers/AuthProvider";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { athleteHomeScreenStyles as styles } from "./AthleteHomeScreen.styles";

const ICON_SIZE = 22;

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
              eyebrow={t("heroEyebrow")}
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
