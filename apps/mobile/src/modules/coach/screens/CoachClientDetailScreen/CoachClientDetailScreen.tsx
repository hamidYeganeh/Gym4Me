"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { CoachClientDetailActionsSection } from "../../sections/CoachClientDetailActionsSection";
import { CoachClientDetailHeroSection } from "../../sections/CoachClientDetailHeroSection";
import { CoachClientDetailNotesSection } from "../../sections/CoachClientDetailNotesSection";
import { CoachClientDetailSessionsSection } from "../../sections/CoachClientDetailSessionsSection";
import { CoachClientDetailStatsSection } from "../../sections/CoachClientDetailStatsSection";
import { CoachClientDetailTrendSection } from "../../sections/CoachClientDetailTrendSection";
import { coachClientDetailScreenStyles as styles } from "./CoachClientDetailScreen.styles";
import type { CoachClientDetailScreenProps } from "./CoachClientDetailScreen.types";

export function CoachClientDetailScreen({
  client,
  messaging = false,
  onSendMessage,
  workoutLogs = [],
  workoutLogsLoading = false,
  workoutLogsError = false,
  reviewingLogId = null,
  onRetryWorkoutLogs,
  onReviewWorkoutLog,
}: CoachClientDetailScreenProps) {
  const t = useTranslations("CoachClientDetail");
  const router = useRouter();
  const [sessionLogged, setSessionLogged] = useState(false);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>({});
  const [reviewErrorId, setReviewErrorId] = useState<string | null>(null);

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <CoachClientDetailHeroSection client={client} />
        <CoachClientDetailTrendSection trendPoints={client.trendPoints} />
        <CoachClientDetailStatsSection
          adherenceSeries={client.adherenceSeries}
          adherenceValue={client.adherenceValue}
          monthlySessionsSeries={client.monthlySessionsSeries}
          monthlySessionsValue={client.monthlySessionsValue}
        />
        <CoachClientDetailSessionsSection
          emptyMessage={t("upcomingEmpty")}
          sessions={client.upcomingSessions}
          title={t("upcomingTitle")}
        />
        <CoachClientDetailSessionsSection
          sessions={client.sessionHistory}
          title={t("historyTitle")}
        />
        <CoachClientDetailNotesSection note={client.note} />
        <section className="rounded-3xl border border-divider bg-content1 p-4" aria-labelledby="workout-review-title">
          <h2 className="text-lg font-bold" id="workout-review-title">{t("workoutReviewsTitle")}</h2>
          {workoutLogsLoading ? <p className="mt-3 text-sm text-muted">{t("workoutReviewsLoading")}</p> : null}
          {workoutLogsError ? (
            <div className="mt-3">
              <p className="text-sm text-danger">{t("workoutReviewsError")}</p>
              <Button className="mt-2" onPress={onRetryWorkoutLogs} size="lg" variant="secondary">{t("retry")}</Button>
            </div>
          ) : null}
          {!workoutLogsLoading && !workoutLogsError && workoutLogs.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t("workoutReviewsEmpty")}</p>
          ) : null}
          <div className="mt-3 space-y-3">
            {workoutLogs.map((log) => (
              <article className="rounded-2xl bg-content2 p-3" key={log.id}>
                <p className="text-sm font-semibold">{t("workoutSession", { session: log.sessionIndex + 1 })}</p>
                <p className="mt-1 text-xs text-muted">{new Date(log.loggedAt).toLocaleDateString("fa-IR-u-ca-persian")}</p>
                {log.reviews.map((review) => <p className="mt-2 text-sm" key={review.id}>{review.note}</p>)}
                <label className="mt-3 block text-sm" htmlFor={`review-${log.id}`}>{t("workoutReviewLabel")}</label>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-2xl border border-divider bg-content1 p-3 text-sm outline-none focus:border-primary"
                  id={`review-${log.id}`}
                  maxLength={2000}
                  onChange={(event) => setReviewDrafts((drafts) => ({ ...drafts, [log.id]: event.target.value }))}
                  value={reviewDrafts[log.id] ?? ""}
                />
                {reviewErrorId === log.id ? (
                  <p aria-live="polite" className="mt-2 text-sm text-danger">{t("submitWorkoutReviewError")}</p>
                ) : null}
                <Button
                  className="mt-2"
                  isDisabled={(reviewDrafts[log.id]?.trim().length ?? 0) < 2}
                  isPending={reviewingLogId === log.id}
                  onPress={async () => {
                    setReviewErrorId(null);
                    try {
                      await onReviewWorkoutLog?.(log.id, reviewDrafts[log.id]?.trim() ?? "");
                      setReviewDrafts((drafts) => ({ ...drafts, [log.id]: "" }));
                    } catch {
                      setReviewErrorId(log.id);
                    }
                  }}
                  size="lg"
                >{t("submitWorkoutReview")}</Button>
              </article>
            ))}
          </div>
        </section>
        <CoachClientDetailActionsSection
          messaging={messaging}
          onLogSession={() => setSessionLogged(true)}
          onSendMessage={onSendMessage}
          sessionLogged={sessionLogged}
        />
      </div>
    </AppLayout>
  );
}
