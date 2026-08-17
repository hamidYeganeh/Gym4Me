import { Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { BOOKING_TIMELINE_STEPS } from "@/modules/athlete/lib/booking-detail-helpers";
import { athleteBookingDetailTimelineSectionVariants } from "./AthleteBookingDetailTimelineSection.styles";
import type { AthleteBookingDetailTimelineSectionProps } from "./AthleteBookingDetailTimelineSection.types";

export function AthleteBookingDetailTimelineSection({
  t,
  currentStepIndex,
}: AthleteBookingDetailTimelineSectionProps) {
  const styles = athleteBookingDetailTimelineSectionVariants();

  return (
    <section className={styles.section()}>
      <Typography className={styles.sectionTitle()} type="body-sm">
        {t("timelineTitle")}
      </Typography>
      <div className={styles.timelineCard()}>
        {BOOKING_TIMELINE_STEPS.map((step, index) => {
          const state =
            index < currentStepIndex
              ? "done"
              : index === currentStepIndex
                ? "current"
                : "pending";
          const isLast = index === BOOKING_TIMELINE_STEPS.length - 1;

          return (
            <div className={styles.timelineStep()} key={step}>
              <div className={styles.timelineMarkers()}>
                <span
                  className={`${styles.timelineDot()} ${
                    state === "done"
                      ? styles.timelineDotDone()
                      : state === "current"
                        ? styles.timelineDotCurrent()
                        : styles.timelineDotPending()
                  }`}
                >
                  {state === "done" ? <Check aria-hidden size={14} /> : null}
                </span>
                {!isLast ? (
                  <span
                    aria-hidden
                    className={`${styles.timelineLine()} ${
                      state === "done"
                        ? styles.timelineLineDone()
                        : styles.timelineLinePending()
                    }`}
                  />
                ) : null}
              </div>
              <div className={styles.timelineBody()}>
                <Typography
                  className={
                    state === "done"
                      ? styles.timelineLabelDone()
                      : state === "current"
                        ? styles.timelineLabelCurrent()
                        : styles.timelineLabelPending()
                  }
                  type="body"
                  weight={state === "current" ? "semibold" : "medium"}
                >
                  {t(`steps.${step}`)}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
