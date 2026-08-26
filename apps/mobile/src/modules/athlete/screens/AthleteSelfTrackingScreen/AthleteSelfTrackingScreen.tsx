"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useRouter } from "@/shared/lib/app-router";

import { formatSummaryValue } from "@/modules/athlete/lib/self-tracking-helpers";
import { useAthleteSelfTracking } from "@/modules/athlete/lib/use-athlete-self-tracking";
import { AthleteSelfTrackingHistorySection } from "@/modules/athlete/sections/AthleteSelfTrackingHistorySection";
import { AthleteSelfTrackingIntroSection } from "@/modules/athlete/sections/AthleteSelfTrackingIntroSection";
import { AthleteSelfTrackingMetricFormSection } from "@/modules/athlete/sections/AthleteSelfTrackingMetricFormSection";
import { AthleteSelfTrackingMetricSelectorSection } from "@/modules/athlete/sections/AthleteSelfTrackingMetricSelectorSection";
import { AthleteSelfTrackingPendingSection } from "@/modules/athlete/sections/AthleteSelfTrackingPendingSection";
import { AthleteSelfTrackingPersonalRecordSection } from "@/modules/athlete/sections/AthleteSelfTrackingPersonalRecordSection";
import { AthleteSelfTrackingSummarySection } from "@/modules/athlete/sections/AthleteSelfTrackingSummarySection";
import { athleteSelfTrackingScreenStyles as styles } from "./AthleteSelfTrackingScreen.styles";
import type { AthleteSelfTrackingScreenProps } from "./AthleteSelfTrackingScreen.types";

export function AthleteSelfTrackingScreen(props: AthleteSelfTrackingScreenProps) {
  const router = useRouter();
  const tracking = useAthleteSelfTracking(props);

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel="بازگشت"
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content}>
        <AthleteSelfTrackingIntroSection
          onDataRightsPress={() => router.push("/athlete/data-rights")}
          onGoalsPress={() => router.push("/athlete/goals")}
          onHealthSyncPress={() => router.push("/athlete/health-sync")}
        />

        <AthleteSelfTrackingPendingSection
          count={tracking.pendingQueue.length}
          onFlushPending={tracking.onFlushPending}
          pending={tracking.pending}
        />

        <AthleteSelfTrackingMetricSelectorSection
          catalog={tracking.catalog}
          onSelect={tracking.selectMetric}
          selectedKey={tracking.selected.key}
        />

        {tracking.selectedSummary ? (
          <AthleteSelfTrackingSummarySection
            formatDate={tracking.formatDate}
            formatSummaryValue={formatSummaryValue}
            summary={tracking.selectedSummary}
            unitLabel={tracking.selected.unitLabel}
          />
        ) : null}

        <AthleteSelfTrackingMetricFormSection
          error={tracking.error}
          message={tracking.message}
          metric={tracking.selected}
          note={tracking.note}
          onNoteChange={tracking.setNote}
          onRecordedAtChange={tracking.setRecordedAt}
          onSubmit={tracking.submitMetric}
          onValueChange={tracking.setValue}
          pending={tracking.pending}
          recordedAt={tracking.recordedAt}
          value={tracking.value}
        />

        <AthleteSelfTrackingHistorySection
          formatDate={tracking.formatDate}
          items={tracking.selectedHistory}
          metric={tracking.selected}
          onDelete={tracking.onDeleteMetric}
          pending={tracking.pending}
        />

        {tracking.personalRecordsEnabled ? (
          <AthleteSelfTrackingPersonalRecordSection
            onRecordDateChange={tracking.setRecordDate}
            onRecordTypeChange={tracking.setRecordType}
            onRecordValueChange={tracking.setRecordValue}
            onSubmit={tracking.submitPersonalRecord}
            pending={tracking.pending}
            personalRecords={tracking.personalRecords}
            recordDate={tracking.recordDate}
            recordType={tracking.recordType}
            recordValue={tracking.recordValue}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
