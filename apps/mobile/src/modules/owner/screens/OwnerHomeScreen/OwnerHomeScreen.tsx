"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { ProfileHeader } from "@repo/ui/layout/ProfileHeader";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { accountActionCenter, mediaFileUrl } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
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
  tasksNewCount = 0,
  actions = [],
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
          hasNotification={DEMO_MODE}
          name={firstName}
          notificationLabel={t("notifications")}
          onNotificationPress={() => router.push("/owner/notifications")}
        />
      }
    >
      <OwnerHomeStaggerSection reduceMotion={reduceMotion}>
        {DEMO_MODE ? (
          <OwnerHomeStaggerItem>
            <OwnerHomeSetupTodoSection
              onFirstClassPress={() => router.push("/owner/clubs")}
            />
          </OwnerHomeStaggerItem>
        ) : null}

        <OwnerHomeStaggerItem>
          <section aria-labelledby="owner-action-center-title" className="space-y-3">
            <h2 className="text-lg font-bold" id="owner-action-center-title">{t("actionCenterTitle")}</h2>
            <p className="text-sm text-muted">{t("actionCenterDescription")}</p>
            {actions.length === 0 ? <p className="text-sm text-muted">{t("actionCenterEmpty")}</p> : null}
            {actions.map((action) => (
              <CallToActionCard
                actionLabel={t("actionCenterOpen")}
                actionType="icon"
                key={action.id}
                onAction={() => {
                  void accountActionCenter.click({
                    itemId: action.id,
                    kind: action.sourceKind,
                  });
                  router.push(action.href);
                }}
                subtitle={t(`action_${action.kind}_description`)}
                title={t(`action_${action.kind}_title`, {
                  count: action.count ?? 0,
                })}
                variant="outlined"
              />
            ))}
          </section>
        </OwnerHomeStaggerItem>

        <OwnerHomeStaggerItem>
          <OwnerHomeQuickLinksSection
            onClubsPress={() => router.push("/owner/clubs")}
            onFinancePress={() => router.push("/owner/finance")}
            onMembersPress={() => router.push("/owner/members")}
            onStaffPress={() => router.push("/owner/staff")}
          />
        </OwnerHomeStaggerItem>

        {DEMO_MODE ? (
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
        ) : null}

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
