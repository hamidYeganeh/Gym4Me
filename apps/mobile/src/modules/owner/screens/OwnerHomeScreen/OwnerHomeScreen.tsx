"use client";

import {
  BarbellHorizontal,
  BookOpen,
  Building2,
  Calendar1,
  ChartBar2,
  House1,
  Kettlebell,
  Megaphone,
  Newspaper1,
  User,
  UsersThree,
  UsersTwo,
  Wallet,
} from "@repo/icons";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { stagger, transition } from "@repo/theme";
import { Logo } from "@repo/ui/common/Logo";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { BottomNav } from "@repo/ui/layout/BottomNav";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import { ProfileStats } from "@repo/ui/layout/ProfileStats";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { OWNER_HOME_TASKS_NEW_COUNT } from "../../lib/owner-home-data";
import { OwnerHomeClubsSection } from "../../sections/OwnerHomeClubsSection";
import { OwnerHomeCreateClubSection } from "../../sections/OwnerHomeCreateClubSection";
import { OwnerHomeQuickActionsSection } from "../../sections/OwnerHomeQuickActionsSection";
import { OwnerHomeStatsSection } from "../../sections/OwnerHomeStatsSection";
import { OwnerHomeTasksOverviewSection } from "../../sections/OwnerHomeTasksOverviewSection";
import { ownerHomeScreenStyles as styles } from "./OwnerHomeScreen.styles";
import type { OwnerHomeScreenProps } from "./OwnerHomeScreen.types";

const ICON_SIZE = 22;
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
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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
                key: "clubs",
                label: t("clubs"),
                icon: <Building2 size={ACTION_ICON_SIZE} />,
                href: "/owner/clubs",
              },
              {
                key: "staff",
                label: t("staff"),
                icon: <UsersThree size={ACTION_ICON_SIZE} />,
                href: "/owner/staff",
              },
              {
                key: "classes",
                label: t("classes"),
                icon: <Kettlebell size={ACTION_ICON_SIZE} />,
                href: "/owner/clubs",
              },
              {
                key: "equipment",
                label: t("equipment"),
                icon: <BarbellHorizontal size={ACTION_ICON_SIZE} />,
                href: "/owner/clubs",
              },
              {
                key: "bookings",
                label: t("bookings"),
                icon: <Calendar1 size={ACTION_ICON_SIZE} />,
                href: "/owner/members",
              },
              {
                key: "lifecycle",
                label: t("lifecycle"),
                icon: <UsersTwo size={ACTION_ICON_SIZE} />,
                href: "/owner/lifecycle",
              },
              {
                key: "analytics",
                label: t("analytics"),
                icon: <ChartBar2 size={ACTION_ICON_SIZE} />,
                href: "/owner/analytics",
              },
              {
                key: "marketing",
                label: t("marketing"),
                icon: <Megaphone size={ACTION_ICON_SIZE} />,
                href: "/owner/analytics",
              },
              {
                key: "resources",
                label: t("resources"),
                icon: <BookOpen size={ACTION_ICON_SIZE} />,
                href: "/owner/resources",
              },
            ],
          }}
          isActionsOpen={isActionsOpen}
          items={[
            {
              key: "home",
              label: t("home"),
              icon: <House1 size={ICON_SIZE} />,
              href: "/owner",
              isActive: true,
            },
            {
              key: "analytics",
              label: t("analytics"),
              icon: <ChartBar2 size={ICON_SIZE} />,
              href: "/owner/analytics",
            },
            {
              key: "resources",
              label: t("resources"),
              icon: <Newspaper1 size={ICON_SIZE} />,
              href: "/owner/resources",
            },
            {
              key: "profile",
              label: t("profile"),
              icon: <User size={ICON_SIZE} />,
              href: "/owner/profile",
            },
          ]}
          onActionsOpenChange={setIsActionsOpen}
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
        </StaggerSection>

        <StaggerSection>
          <OwnerHomeQuickActionsSection
            bookingsLabel={t("quickActionBookings")}
            classesLabel={t("quickActionClasses")}
            equipmentLabel={t("quickActionEquipment")}
            moreLabel={t("quickActionMore")}
            sectionLabel={t("quickActionsLabel")}
            onBookingsPress={() => router.push("/owner/members")}
            onClassesPress={() => router.push("/owner/clubs")}
            onEquipmentPress={() => router.push("/owner/clubs")}
            onMorePress={() => setIsActionsOpen(true)}
          />
        </StaggerSection>

        <StaggerSection>
          <section
            aria-label={t("quickLinksTitle")}
            className="grid grid-cols-5 gap-2"
          >
            <QuickActionCard
              icon={<Building2 size={ACTION_ICON_SIZE} />}
              label={t("quickLinkClubs")}
              onPress={() => router.push("/owner/clubs")}
            />
            <QuickActionCard
              icon={<UsersThree size={ACTION_ICON_SIZE} />}
              label={t("quickLinkMembers")}
              onPress={() => router.push("/owner/members")}
            />
            <QuickActionCard
              icon={<UsersTwo size={ACTION_ICON_SIZE} />}
              label={t("quickLinkStaff")}
              onPress={() => router.push("/owner/staff")}
            />
            <QuickActionCard
              icon={<Wallet size={ACTION_ICON_SIZE} />}
              label={t("quickLinkFinance")}
              onPress={() => router.push("/owner/finance")}
            />
            <QuickActionCard
              icon={<ChartBar2 size={ACTION_ICON_SIZE} />}
              label={t("quickLinkAnalytics")}
              onPress={() => router.push("/owner/analytics")}
            />
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
