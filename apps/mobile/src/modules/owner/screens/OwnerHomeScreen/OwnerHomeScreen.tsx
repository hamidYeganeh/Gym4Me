"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { mediaFileUrl } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OWNER_HOME_TASKS_NEW_COUNT } from "../../lib/owner-home-data";
import { OwnerHomeClubsSection } from "../../sections/OwnerHomeClubsSection";
import { OwnerHomeCreateClubSection } from "../../sections/OwnerHomeCreateClubSection";
import { OwnerHomeQuickLinksSection } from "../../sections/OwnerHomeQuickLinksSection";
import { OwnerHomeSetupTodoSection } from "../../sections/OwnerHomeSetupTodoSection";
import { OwnerHomeStatsSection } from "../../sections/OwnerHomeStatsSection";
import {
  OwnerHomeStaggerItem,
  OwnerHomeStaggerSection,
} from "../../sections/OwnerHomeStaggerSection";
import { OwnerHomeTasksOverviewSection } from "../../sections/OwnerHomeTasksOverviewSection";
import { ownerHomeScreenStyles as styles } from "./OwnerHomeScreen.styles";
import type { OwnerHomeScreenProps } from "./OwnerHomeScreen.types";

export function OwnerHomeScreen({
  stats,
  clubs,
  tasksNewCount = OWNER_HOME_TASKS_NEW_COUNT,
}: OwnerHomeScreenProps) {
  const t = useTranslations("OwnerHome");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const firstName = user?.name.first?.trim() ?? "";

  return (
    <AppLayout
      className={styles.root}
      header={
        <ProfileHeader
          avatarAlt={firstName}
          avatarSrc={mediaFileUrl(user?.avatar.mediaId) ?? undefined}
          bio={t("subtitle")}
          hasNotification
          name={firstName}
          notificationLabel={t("notifications")}
          onNotificationPress={() => router.push("/owner/notifications")}
        />
      }
    >
      <OwnerHomeStaggerSection reduceMotion={reduceMotion}>
        <OwnerHomeStaggerItem>
          <OwnerHomeSetupTodoSection
            onFirstClassPress={() => router.push("/owner/clubs")}
          />
        </OwnerHomeStaggerItem>

        <OwnerHomeStaggerItem>
          <OwnerHomeQuickLinksSection
            onClubsPress={() => router.push("/owner/clubs")}
            onFinancePress={() => router.push("/owner/finance")}
            onMembersPress={() => router.push("/owner/members")}
            onStaffPress={() => router.push("/owner/staff")}
          />
        </OwnerHomeStaggerItem>

        <OwnerHomeStaggerItem>
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
        </OwnerHomeStaggerItem>

        <OwnerHomeStaggerItem>
          <OwnerHomeCreateClubSection
            actionLabel={t("createClubAction")}
            badge={t("createClubBadge")}
            meta={t("createClubMeta")}
            onAction={() => router.push("/owner/clubs/create")}
            subtitle={t("createClubSubtitle")}
            title={t("createClubTitle")}
          />
        </OwnerHomeStaggerItem>

        <OwnerHomeStaggerItem>
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
        </OwnerHomeStaggerItem>

        <OwnerHomeStaggerItem>
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
        </OwnerHomeStaggerItem>
      </OwnerHomeStaggerSection>
    </AppLayout>
  );
}
