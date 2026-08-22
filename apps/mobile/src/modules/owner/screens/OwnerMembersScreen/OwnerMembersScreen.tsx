"use client";

import { Button } from "@heroui/react/button";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useOwnerMembersScreen } from "@/modules/owner/lib/use-owner-members-screen";
import { OwnerMembersImportSection } from "@/modules/owner/sections/OwnerMembersImportSection";
import { OwnerMembersIntroSection } from "@/modules/owner/sections/OwnerMembersIntroSection";
import { OwnerMembersListSection } from "@/modules/owner/sections/OwnerMembersListSection";
import { OwnerMembersSellSection } from "@/modules/owner/sections/OwnerMembersSellSection";
import { OwnerMembersStatsSection } from "@/modules/owner/sections/OwnerMembersStatsSection";
import { ownerMembersScreenStyles as styles } from "./OwnerMembersScreen.styles";
import type {
  OwnerMembersFilterId,
  OwnerMembersScreenProps,
} from "./OwnerMembersScreen.types";

const FILTERS = [
  { id: "all", labelKey: "filterAll" },
  { id: "active", labelKey: "filterActive" },
  { id: "expiring", labelKey: "filterExpiring" },
  { id: "frozen", labelKey: "filterFrozen" },
  { id: "expired", labelKey: "filterExpired" },
] as const satisfies readonly {
  id: OwnerMembersFilterId;
  labelKey: string;
}[];

export function OwnerMembersScreen({
  members,
  stats,
  className,
  plans = [],
  pending = false,
  onCheckIn,
  onFreeze,
  onUnfreeze,
  onSell,
  onImport,
}: OwnerMembersScreenProps) {
  const t = useTranslations("OwnerMembers");
  const router = useRouter();
  const desk = useOwnerMembersScreen({
    members,
    onCheckIn,
    onSell,
    onImport,
    plans,
  });

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
          endContent={
            <Button
              onPress={() => router.push("/owner/check-in")}
              size="sm"
              variant="secondary"
            >
              {t("checkInDeskLink")}
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <OwnerMembersIntroSection
          countLabel={t("totalCount", { count: members.length })}
          subtitle={t("subtitle")}
          title={t("title")}
        />

        <OwnerMembersStatsSection
          activeTitle={t("statActiveTitle")}
          activeUnit={t("statActiveUnit")}
          stats={stats}
          weekTitle={t("statWeekTitle")}
          weekUnit={t("statWeekUnit")}
        />

        {desk.showSell ? (
          <OwnerMembersSellSection
            {...desk}
            channelCard={t("channelCard")}
            channelCash={t("channelCash")}
            channelLabel={t("sellChannelLabel")}
            channelMixed={t("channelMixed")}
            channelPos={t("channelPos")}
            debtDueLabel={t("debtDueLabel")}
            installmentCountLabel={t("installmentCountLabel")}
            nameLabel={t("sellNameLabel")}
            paidAmountLabel={t("sellPaidAmountLabel")}
            pending={pending}
            phoneLabel={t("sellPhoneLabel")}
            planLabel={t("sellPlanLabel")}
            planPriceLabel={(values) => t("sellPlanPrice", values)}
            plans={plans}
            referenceLabel={t("sellReferenceLabel")}
            submitLabel={t("sellSubmit")}
            title={t("sellTitle")}
          />
        ) : null}

        {desk.showImport ? (
          <OwnerMembersImportSection
            {...desk}
            commitLabel={t("importCommit")}
            hint={t("importHint")}
            importDoneLabel={t("importDone")}
            importErrorLabel={t("importError")}
            summaryLabel={(values) => t("importSummary", values)}
            title={t("importTitle")}
          />
        ) : null}

        <OwnerMembersListSection
          {...desk}
          checkInAction={(values) => t("checkInAction", values)}
          emptyBody={t("emptyBody")}
          emptyTitle={t("emptyTitle")}
          filters={FILTERS.map((filter) => ({
            id: filter.id,
            label: t(filter.labelKey),
          }))}
          filtersLabel={t("filtersLabel")}
          freezeAction={t("freezeAction")}
          listLabel={t("listLabel")}
          onFreeze={onFreeze}
          onUnfreeze={onUnfreeze}
          pending={pending}
          searchLabel={t("searchLabel")}
          searchPlaceholder={t("searchPlaceholder")}
          sessionsLabel={t("sessionsLabel")}
          stateLabels={{
            active: t("stateActive"),
            expiring: t("stateExpiring"),
            frozen: t("stateFrozen"),
            expired: t("stateExpired"),
          }}
          checkedInChip={t("checkedInChip")}
          unfreezeAction={t("unfreezeAction")}
        />
      </div>
    </AppLayout>
  );
}
