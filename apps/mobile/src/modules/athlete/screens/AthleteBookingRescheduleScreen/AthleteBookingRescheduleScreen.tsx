"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type Booking } from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { CoachAvailabilitySlots } from "@repo/ui/cards/CoachAvailabilitySlots";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useEffect, useMemo, useState } from "react";
import { useCoachSlotsWeek } from "@/shared/hooks/useCoachSlotsWeek";
import { accountBookings } from "@/shared/lib/api";
import { formatJalaliDateTime } from "@/shared/lib/booking-view";
import {
  addDaysIso,
  formatJalaliDateShort,
  formatJalaliRangeLabel,
  todayIso,
  weekdayKey,
  weekdaySat0,
  weekRangeContaining,
} from "@/shared/lib/week-calendar";
import { athleteBookingRescheduleScreenStyles as styles } from "./AthleteBookingRescheduleScreen.styles";
import type { AthleteBookingRescheduleScreenProps } from "./AthleteBookingRescheduleScreen.types";

export function AthleteBookingRescheduleScreen({
  bookingId,
}: AthleteBookingRescheduleScreenProps) {
  const t = useTranslations("AthleteBookingReschedule");
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const range = weekRangeContaining(anchor);

  const week = useCoachSlotsWeek(booking?.coachUserId ?? "", range.from, {
    enabled: Boolean(booking),
  });

  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    accountBookings
      .get(bookingId)
      .then((result) => {
        if (!cancelled) setBooking(result);
      })
      .catch(() => {
        if (!cancelled) setError(t("loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBooking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, t]);

  const selectedSlot = useMemo(() => {
    for (const day of week.days) {
      const slot = day.slots.find(
        (entry) => entry.id === selectedSlotId && entry.status === "available",
      );
      if (slot) return slot;
    }
    return null;
  }, [selectedSlotId, week.days]);

  const availabilityDays = useMemo(
    () =>
      week.days
        .filter((day) => day.slots.length > 0)
        .map((day) => ({
          id: day.id,
          label:
            day.date === today
              ? t("today")
              : `${t(`weekday.${weekdayKey(weekdaySat0(day.date))}`)} ${formatJalaliDateShort(day.date)}`,
          slots: day.slots.map((slot) => ({
            id: slot.id,
            timeLabel: slot.timeLabel,
            status: slot.status,
          })),
        })),
    [t, today, week.days],
  );

  const onConfirm = async () => {
    if (!booking || !selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await accountBookings.reschedule(booking.id, {
        slotId: selectedSlot.id,
      });
      router.replace(`/athlete/bookings/${booking.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("submitError"));
      setIsSubmitting(false);
    }
  };

  const pageHeader = (
    <SecondaryPageHeader
      backAriaLabel={t("back")}
      onBack={() => router.back()}
      title={t("title")}
    />
  );

  if (isLoadingBooking) {
    return (
      <AppLayout className={styles.root} header={pageHeader}>
        <div className={styles.loading}>
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className={styles.root} header={pageHeader}>
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {booking ? (
          <div className={styles.currentCard}>
            <Typography className={styles.currentLabel} type="body-sm">
              {t("currentSlot")}
            </Typography>
            <Typography
              className={styles.currentValue}
              type="body"
              weight="semibold"
            >
              {formatJalaliDateTime(booking.startsAt)}
            </Typography>
          </div>
        ) : null}

        <div className={styles.weekRow}>
          <Typography className={styles.weekLabel} weight="bold">
            {formatJalaliRangeLabel(range.from, range.to)}
          </Typography>
          <div className={styles.weekNav}>
            <Button
              aria-label={t("prevWeek")}
              className={styles.weekButton}
              isIconOnly
              onPress={() => setAnchor(addDaysIso(range.from, -7))}
              size="lg"
            >
              <ChevronRight
                aria-hidden
                className={styles.weekButtonIcon}
                rtlMirror={false}
                size={18}
              />
            </Button>
            <Button
              aria-label={t("nextWeek")}
              className={styles.weekButton}
              isIconOnly
              onPress={() => setAnchor(addDaysIso(range.from, 7))}
              size="lg"
            >
              <ChevronLeft
                aria-hidden
                className={styles.weekButtonIcon}
                rtlMirror={false}
                size={18}
              />
            </Button>
          </div>
        </div>

        {availabilityDays.length > 0 ? (
          <CoachAvailabilitySlots
            availableLabel={t("slotAvailable")}
            days={availabilityDays}
            onSlotPress={(slot) => setSelectedSlotId(slot.id)}
            selectedSlotId={selectedSlotId}
            title={t("slotsTitle")}
            unavailableLabel={t("slotUnavailable")}
          />
        ) : (
          <div className={styles.emptySlots}>
            <Typography type="body-sm">
              {week.isLoading ? t("slotsLoading") : t("slotsEmpty")}
            </Typography>
          </div>
        )}

        {error ? (
          <Typography className={styles.errorText} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>

      <StickyBottomActions contentClassName={styles.footer}>
        <Typography className={styles.summary} type="body-sm">
          {selectedSlot
            ? t("selectedSummary", {
                date: formatJalaliDateShort(selectedSlot.date),
                time: selectedSlot.timeLabel,
              })
            : t("selectPrompt")}
        </Typography>
        <Button
          className={styles.confirm}
          isDisabled={!selectedSlot || !booking}
          isPending={isSubmitting}
          onPress={() => void onConfirm()}
          size="lg"
          variant="primary"
        >
          {t("confirm")}
        </Button>
      </StickyBottomActions>
    </AppLayout>
  );
}
