"use client";

import { Typography } from "@heroui/react";
import { Building2, UsersThree, UsersTwo, Wallet } from "@repo/icons";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { stagger, transition } from "@repo/theme";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { mediaFileUrl } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OWNER_HOME_TASKS_NEW_COUNT } from "../../lib/owner-home-data";
import { OwnerHomeClubsSection } from "../../sections/OwnerHomeClubsSection";
import { OwnerHomeCreateClubSection } from "../../sections/OwnerHomeCreateClubSection";
import { OwnerHomeStatsSection } from "../../sections/OwnerHomeStatsSection";
import { OwnerHomeTasksOverviewSection } from "../../sections/OwnerHomeTasksOverviewSection";
import { ownerHomeScreenStyles as styles } from "./OwnerHomeScreen.styles";
import type { OwnerHomeScreenProps } from "./OwnerHomeScreen.types";

const ACTION_ICON_SIZE = 22;

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
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition,
  },
};

function StaggerSection({ children }: { children: ReactNode }) {
  return <motion.div variants={sectionVariants}>{children}</motion.div>;
}

export function OwnerHomeScreen({
  stats,
  clubs,
  tasksNewCount = OWNER_HOME_TASKS_NEW_COUNT,
}: OwnerHomeScreenProps) {
  const t = useTranslations("OwnerHome");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const displayName =
    [user?.name.first, user?.name.last].filter(Boolean).join(" ") ||
    user?.phone ||
    t("profileName");

  const setupItems: TodoCardItem[] = [
    {
      id: "club-profile",
      label: t("todoItemClubProfile"),
      status: "completed",
    },
    {
      id: "staff",
      label: t("todoItemStaff"),
      status: "completed",
    },
    {
      id: "verify",
      label: t("todoItemVerify"),
      status: "completed",
    },
    {
      id: "first-class",
      label: t("todoItemFirstClass"),
      status: "pending",
      onPress: () => router.push("/owner/clubs"),
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
          onNotificationPress={() => router.push("/owner/notifications")}
        />
      }
    >
      <motion.div
        animate="visible"
        className={styles.content}
        initial={reduceMotion ? false : "hidden"}
        variants={contentVariants}
      >
        <StaggerSection>
          <TodoCard
            items={setupItems}
            progressLabel={t("todoProgressLabel")}
            stepLabel={t("todoStepLabel", {
              current: completedCount,
              total: setupItems.length,
            })}
            title={t("todoTitle")}
          />
        </StaggerSection>

        <StaggerSection>
          <section
            aria-label={t("quickLinksTitle")}
            className={styles.quickLinksSection}
          >
            <div className={styles.sectionHeader}>
              <Typography
                className={styles.sectionTitle}
                type="h4"
                weight="semibold"
              >
                {t("quickLinksTitle")}
              </Typography>
              <Typography className={styles.sectionDescription} type="body-sm">
                {t("quickLinksDescription")}
              </Typography>
            </div>
            <div className={styles.quickLinksGrid}>
              <QuickActionCard
                icon={<Building2 size={ACTION_ICON_SIZE} />}
                label={t("quickLinkClubs")}
                layout="row"
                onPress={() => router.push("/owner/clubs")}
              />
              <QuickActionCard
                icon={<UsersThree size={ACTION_ICON_SIZE} />}
                label={t("quickLinkMembers")}
                layout="row"
                onPress={() => router.push("/owner/members")}
              />
              <QuickActionCard
                icon={<UsersTwo size={ACTION_ICON_SIZE} />}
                label={t("quickLinkStaff")}
                layout="row"
                onPress={() => router.push("/owner/staff")}
              />
              <QuickActionCard
                icon={<Wallet size={ACTION_ICON_SIZE} />}
                label={t("quickLinkFinance")}
                layout="row"
                onPress={() => router.push("/owner/finance")}
              />
            </div>
          </section>
        </StaggerSection>

        <StaggerSection>
          <OwnerHomeTasksOverviewSection
            assigned={{
              id: "assigned",
              title: t("tasksAssignedTitle"),
              value: t("tasksAssignedValue"),
              description: t("tasksAssignedDescription"),
              actionLabel: t("tasksAssignedAction"),
            }}
            primary={{
              id: "primary",
              title: t("tasksPrimaryTitle"),
              value: t("tasksPrimaryValue"),
              description: t("tasksPrimaryDescription"),
              actionLabel: t("tasksPrimaryAction"),
            }}
            seeAllLabel={t("tasksOverviewSeeAll")}
            summary={t.rich("tasksOverviewSummary", {
              count: tasksNewCount,
              bold: (chunks) => (
                <span className="font-bold text-foreground">{chunks}</span>
              ),
            })}
            title={t("tasksOverviewTitle")}
            upcoming={{
              id: "upcoming",
              title: t("tasksUpcomingTitle"),
              value: t("tasksUpcomingValue"),
              description: t("tasksUpcomingDescription"),
              actionLabel: t("tasksUpcomingAction"),
            }}
          />
        </StaggerSection>

        <StaggerSection>
          <OwnerHomeCreateClubSection
            actionLabel={t("createClubAction")}
            badge={t("createClubBadge")}
            meta={t("createClubMeta")}
            onAction={() => router.push("/owner/clubs/create")}
            subtitle={t("createClubSubtitle")}
            title={t("createClubTitle")}
          />
        </StaggerSection>

        <StaggerSection>
          <OwnerHomeStatsSection
            copyLabel={t("statCopy")}
            editLabel={t("statEdit")}
            labels={{
              statMembers: t("statMembers"),
              statMembersUnit: t("statMembersUnit"),
              statBookings: t("statBookings"),
              statBookingsUnit: t("statBookingsUnit"),
              statRevenue: t("statRevenue"),
              statRevenueUnit: t("statRevenueUnit"),
              statOccupancy: t("statOccupancy"),
              statOccupancyUnit: t("statOccupancyUnit"),
            }}
            stats={stats}
            onCopyClick={(card) => {
              void navigator.clipboard?.writeText(card.value);
            }}
          />
        </StaggerSection>

        <StaggerSection>
          <OwnerHomeClubsSection
            actionLabel={t("clubAction")}
            clubs={clubs}
            favoriteLabel={t("clubFavorite")}
            onClubAction={(clubId) => router.push(`/owner/clubs/${clubId}`)}
            pricePrefix={t("clubPricePrefix")}
            priceSuffix={t("clubPriceSuffix")}
            shareLabel={t("clubShare")}
            title={t("myClubsTitle")}
          />
        </StaggerSection>
      </motion.div>
    </AppLayout>
  );
}
