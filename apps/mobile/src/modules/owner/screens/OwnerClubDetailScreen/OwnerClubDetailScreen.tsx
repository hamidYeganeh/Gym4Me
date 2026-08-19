"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OwnerClubDetailBranchesSection } from "@/modules/owner/sections/OwnerClubDetailBranchesSection";
import { OwnerClubDetailClassesSection } from "@/modules/owner/sections/OwnerClubDetailClassesSection";
import { OwnerClubDetailIntroSection } from "@/modules/owner/sections/OwnerClubDetailIntroSection";
import { OwnerClubDetailOverviewSection } from "@/modules/owner/sections/OwnerClubDetailOverviewSection";
import { OwnerClubDetailSlotsSection } from "@/modules/owner/sections/OwnerClubDetailSlotsSection";
import { OwnerClubDetailTabsSection } from "@/modules/owner/sections/OwnerClubDetailTabsSection";
import { ownerClubDetailScreenStyles as styles } from "./OwnerClubDetailScreen.styles";
import type {
  OwnerClubDetailScreenProps,
  OwnerClubDetailTabId,
} from "./OwnerClubDetailScreen.types";

const TABS = [
  { id: "overview", labelKey: "tabOverview" },
  { id: "branches", labelKey: "tabBranches" },
  { id: "classes", labelKey: "tabClasses" },
  { id: "slots", labelKey: "tabSlots" },
] as const satisfies readonly {
  id: OwnerClubDetailTabId;
  labelKey: string;
}[];

const TODAY_LABEL_KEY = {
  "check-ins": "todayCheckIns",
  "new-members": "todayNewMembers",
  bookings: "todayBookings",
} as const;

export function OwnerClubDetailScreen({
  club,
  className,
}: OwnerClubDetailScreenProps) {
  const t = useTranslations("OwnerClubDetail");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OwnerClubDetailTabId>("overview");

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content}>
        <OwnerClubDetailIntroSection city={club.city} name={club.name} />

        <OwnerClubDetailTabsSection
          activeTab={activeTab}
          ariaLabel={t("tabsLabel")}
          onTabChange={setActiveTab}
          tabs={TABS.map((tab) => ({
            id: tab.id,
            label: t(tab.labelKey),
          }))}
        />

        {activeTab === "overview" ? (
          <OwnerClubDetailOverviewSection
            attendanceSeries={club.attendanceSeries}
            attendanceTitle={t("attendanceTitle")}
            attendanceUnit={t("attendanceUnit")}
            attendanceValue={club.attendanceValue}
            occupancyTrend={club.occupancyTrend}
            occupancyTrendTitle={t("occupancyTrendTitle")}
            revenueComparisonSeries={club.revenueComparisonSeries}
            revenueSeries={club.revenueSeries}
            revenueTitle={t("revenueTitle")}
            revenueUnit={t("revenueUnit")}
            revenueValue={club.revenueValue}
            todayLabelFor={(id) => t(TODAY_LABEL_KEY[id])}
            todayRows={club.today}
            todayTitle={t("todayTitle")}
          />
        ) : null}

        {activeTab === "branches" ? (
          <OwnerClubDetailBranchesSection
            activeStateLabel={t("branchStateActive")}
            addBranchLabel={t("addBranch")}
            branches={club.branches}
            maintenanceStateLabel={t("branchStateMaintenance")}
            title={t("branchesTitle")}
          />
        ) : null}

        {activeTab === "classes" ? (
          <OwnerClubDetailClassesSection
            activeStateLabel={t("classStateActive")}
            classes={club.classes}
            enrolledLabel={t("enrolledLabel")}
            pausedStateLabel={t("classStatePaused")}
            title={t("classesTitle")}
          />
        ) : null}

        {activeTab === "slots" ? (
          <OwnerClubDetailSlotsSection
            hint={t("slotsHint")}
            slotDays={club.slotDays}
            title={t("slotsTitle")}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
