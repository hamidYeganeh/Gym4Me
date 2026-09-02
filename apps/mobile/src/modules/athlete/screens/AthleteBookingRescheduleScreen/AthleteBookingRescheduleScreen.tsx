"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type Booking } from "@repo/api";
import { supplyApi, useApiClient, type AvailabilitySlot } from "@repo/api/v2";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { CoachAvailabilitySlots } from "@repo/ui/cards/CoachAvailabilitySlots";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import { useSearchParams } from "next/navigation";

import { useEffect, useMemo, useState } from "react";
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
  const searchParams = useSearchParams();
  const client = useApiClient();
  const resolvedBookingId = bookingId ?? searchParams.get("bookingId") ?? "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const range = weekRangeContaining(anchor);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    accountBookings
      .get(resolvedBookingId)
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
  }, [resolvedBookingId, t]);

  useEffect(() => {
    if (!booking?.resource.refId) return;
    let cancelled = false;
    const from = new Date(`${range.from}T00:00:00+03:30`);
    const to = new Date(`${addDaysIso(range.to, 1)}T00:00:00+03:30`);
    const durationMinutes = Math.max(
      1,
      Math.round((new Date(booking.endsAt).getTime() - new Date(booking.startsAt).getTime()) / 60_000),
    );
    setSlotsLoading(true);
    supplyApi
      .slots(
        client,
        booking.resource.refId,
        {
          from: from.toISOString(),
          to: to.toISOString(),
          duration_minutes: durationMinutes,
          participants: booking.attendeeCount,
          exclude_booking_id: booking.id,
        },
        true,
      )
      .then((result) => {
        if (!cancelled) setSlots(result.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking, client, range.from, range.to]);

  const selectedSlot = useMemo(() => {
    return slots.find((entry) => entry.startAt === selectedStartsAt && entry.status === "available") ?? null;
  }, [selectedStartsAt, slots]);

  const availabilityDays = useMemo(
    () => {
      const grouped = new Map<string, AvailabilitySlot[]>();
      for (const slot of slots) grouped.set(slot.localDate, [...(grouped.get(slot.localDate) ?? []), slot]);
      return [...grouped.entries()]
        .map(([date, daySlots]) => ({
          id: date,
          label:
            date === today
              ? t("today")
              : `${t(`weekday.${weekdayKey(weekdaySat0(date))}`)} ${formatJalaliDateShort(date)}`,
          slots: daySlots.map((slot) => ({
            id: slot.startAt,
            timeLabel: new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(new Date(slot.startAt)),
            status: slot.status === "available" ? "available" as const : "unavailable" as const,
          })),
        }));
    },
    [slots, t, today],
  );

  const onConfirm = async () => {
    if (!booking || !selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await accountBookings.reschedule(booking.id, { startsAt: selectedSlot.startAt });
      router.replace(`/athlete/booking/detail?bookingId=${encodeURIComponent(booking.id)}`);
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
            onSlotPress={(slot) => setSelectedStartsAt(slot.id)}
            selectedSlotId={selectedStartsAt}
            title={t("slotsTitle")}
            unavailableLabel={t("slotUnavailable")}
          />
        ) : (
          <div className={styles.emptySlots}>
            <Typography type="body-sm">
              {slotsLoading ? t("slotsLoading") : t("slotsEmpty")}
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
                date: formatJalaliDateShort(selectedSlot.localDate),
                time: new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(new Date(selectedSlot.startAt)),
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
