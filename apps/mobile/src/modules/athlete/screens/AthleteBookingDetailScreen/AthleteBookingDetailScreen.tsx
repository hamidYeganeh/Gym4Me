"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingStatus } from "../../lib/bookings-data";
import { getBookingStatusColor } from "../AthleteBookingsScreen";
import { athleteBookingDetailScreenStyles as styles } from "./AthleteBookingDetailScreen.styles";
import type {
  AthleteBookingDetailScreenProps,
  BookingTimelineStepId,
} from "./AthleteBookingDetailScreen.types";

const TIMELINE_STEPS: BookingTimelineStepId[] = [
  "created",
  "payment",
  "confirm",
  "attend",
  "finish",
];

function getCurrentStepIndex(status: BookingStatus): number {
  switch (status) {
    case "AWAITING_PAYMENT":
      return 1;
    case "PENDING":
      return 2;
    case "CONFIRMED":
      return 3;
    case "CHECKED_IN":
      return 4;
    case "COMPLETED":
    case "REFUND_REQUESTED":
    case "REFUNDED":
      return TIMELINE_STEPS.length;
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return 2;
    default:
      return 0;
  }
}

export function AthleteBookingDetailScreen({
  booking,
}: AthleteBookingDetailScreenProps) {
  const t = useTranslations("AthleteBookingDetail");
  const tBookings = useTranslations("AthleteBookings");
  const router = useRouter();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCancelRequested, setIsCancelRequested] = useState(false);

  const backButton = (
    <Button
      aria-label={t("back")}
      isIconOnly
      onPress={() => router.back()}
      size="lg"
      variant="ghost"
    >
      <ChevronLeft className="text-foreground" size={22} />
    </Button>
  );

  if (!booking) {
    return (
      <AppLayout
        className={styles.root}
        header={
          <Header startContent={backButton} />
        }
      >
        <div className={styles.content}>
          <div className={styles.empty}>
            <Typography className={styles.emptyTitle} type="h4" weight="semibold">
              {t("notFound")}
            </Typography>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentStepIndex = getCurrentStepIndex(booking.status);
  const showCheckIn =
    (booking.status === "CONFIRMED" || booking.status === "CHECKED_IN") &&
    Boolean(booking.checkInCode);
  const showPayAction =
    booking.status === "AWAITING_PAYMENT" && Boolean(booking.invoiceId);
  const showCancelAction =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    !isCancelRequested;

  const detailRows = [
    { key: "date", label: t("date"), value: booking.dateLabel },
    { key: "time", label: t("time"), value: booking.timeLabel },
    { key: "location", label: t("location"), value: booking.locationLabel },
    { key: "price", label: t("price"), value: booking.priceLabel },
  ];

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header startContent={backButton} />
      }
    >
      <div className={styles.content}>
        <section className={styles.hero}>
          <Chip color={getBookingStatusColor(booking.status)}>
            <Chip.Label>{tBookings(`status.${booking.status}`)}</Chip.Label>
          </Chip>
          <Typography className={styles.heroTitle} type="h1" weight="bold">
            {booking.title}
          </Typography>
          <Typography className={styles.heroClub} type="body">
            {booking.clubName}
          </Typography>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("timelineTitle")}
          </Typography>
          <div className={styles.timelineCard}>
            {TIMELINE_STEPS.map((step, index) => {
              const state =
                index < currentStepIndex
                  ? "done"
                  : index === currentStepIndex
                    ? "current"
                    : "pending";
              const isLast = index === TIMELINE_STEPS.length - 1;

              return (
                <div className={styles.timelineStep} key={step}>
                  <div className={styles.timelineMarkers}>
                    <span
                      className={`${styles.timelineDot} ${
                        state === "done"
                          ? styles.timelineDotDone
                          : state === "current"
                            ? styles.timelineDotCurrent
                            : styles.timelineDotPending
                      }`}
                    >
                      {state === "done" ? <Check aria-hidden size={14} /> : null}
                    </span>
                    {!isLast ? (
                      <span
                        aria-hidden
                        className={`${styles.timelineLine} ${
                          state === "done"
                            ? styles.timelineLineDone
                            : styles.timelineLinePending
                        }`}
                      />
                    ) : null}
                  </div>
                  <div className={styles.timelineBody}>
                    <Typography
                      className={
                        state === "done"
                          ? styles.timelineLabelDone
                          : state === "current"
                            ? styles.timelineLabelCurrent
                            : styles.timelineLabelPending
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

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("detailsTitle")}
          </Typography>
          <div className={styles.detailsCard}>
            {detailRows.map((row, index) => (
              <div key={row.key}>
                <div className={styles.detailRow}>
                  <Typography className={styles.detailLabel} type="body-sm">
                    {row.label}
                  </Typography>
                  <Typography
                    className={styles.detailValue}
                    type="body"
                    weight="medium"
                  >
                    {row.value}
                  </Typography>
                </div>
                {index < detailRows.length - 1 ? (
                  <div aria-hidden className={styles.divider} />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {showCheckIn ? (
          <section className={styles.checkInCard}>
            <Typography className={styles.checkInTitle} type="h4" weight="semibold">
              {t("checkInTitle")}
            </Typography>
            <span className={styles.checkInCode}>{booking.checkInCode}</span>
            <Typography className={styles.checkInHint} type="body-sm">
              {t("checkInHint")}
            </Typography>
          </section>
        ) : null}

        <div className={styles.actions}>
          {showPayAction ? (
            <Button
              fullWidth
              onPress={() => router.push(`/athlete/payment/${booking.invoiceId}`)}
              size="lg"
              variant="primary"
            >
              {t("payNow")}
            </Button>
          ) : null}

          {isCancelRequested ? (
            <div className={styles.cancelledNotice}>
              <Typography className={styles.cancelledNoticeText} type="body-sm">
                {t("cancelRequested")}
              </Typography>
            </div>
          ) : null}

          {showCancelAction && !isCancelConfirmOpen ? (
            <Button
              className="text-danger"
              fullWidth
              onPress={() => setIsCancelConfirmOpen(true)}
              size="lg"
              variant="ghost"
            >
              {t("cancelBooking")}
            </Button>
          ) : null}

          {showCancelAction && isCancelConfirmOpen ? (
            <div className={styles.cancelConfirm}>
              <Typography
                className={styles.cancelConfirmTitle}
                type="body"
                weight="semibold"
              >
                {t("cancelConfirmTitle")}
              </Typography>
              <Typography className={styles.cancelConfirmBody} type="body-sm">
                {t("cancelConfirmBody")}
              </Typography>
              <div className={styles.cancelConfirmActions}>
                <Button
                  fullWidth
                  onPress={() => {
                    setIsCancelConfirmOpen(false);
                    setIsCancelRequested(true);
                  }}
                  variant="danger"
                >
                  {t("confirmCancel")}
                </Button>
                <Button
                  fullWidth
                  onPress={() => setIsCancelConfirmOpen(false)}
                  variant="ghost"
                >
                  {t("keepBooking")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
