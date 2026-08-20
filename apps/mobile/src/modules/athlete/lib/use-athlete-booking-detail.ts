"use client";

import { ApiError, type BookingCancellationPreview } from "@repo/api";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import { accountBookings } from "@/shared/lib/api";
import { canManageBooking } from "@/modules/athlete/lib/bookings-data";
import type { BookingCancelReasonKey } from "@/modules/athlete/lib/api-bookings";
import type { AthleteBookingDetailScreenProps } from "@/modules/athlete/screens/AthleteBookingDetailScreen/AthleteBookingDetailScreen.types";
import { getBookingTimelineStepIndex } from "@/modules/athlete/lib/booking-detail-helpers";

export function useAthleteBookingDetail({
  booking,
  onBookingChange,
}: AthleteBookingDetailScreenProps) {
  const t = useTranslations("AthleteBookingDetail");
  const router = useRouter();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCancelRequested, setIsCancelRequested] = useState(false);
  const [cancelReasonKey, setCancelReasonKey] =
    useState<BookingCancelReasonKey | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellationPreview, setCancellationPreview] =
    useState<BookingCancellationPreview | null>(null);

  const isApiBooking = Boolean(booking?.api);

  const runAction = async (action: () => Promise<void>) => {
    setIsActing(true);
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : t("actionError"),
      );
    } finally {
      setIsActing(false);
    }
  };

  const onPay = () => {
    if (!booking) return;
    if (!isApiBooking) {
      router.push(`/athlete/payment/${booking.invoiceId}`);
      return;
    }
    void runAction(async () => {
      const payment = await accountBookings.pay(
        booking.id,
        `${window.location.origin}/athlete/bookings/${booking.id}`,
      );
      window.location.assign(payment.redirectUrl);
    });
  };

  const onConfirmCancel = () => {
    if (!booking) return;
    if (!isApiBooking) {
      setIsCancelConfirmOpen(false);
      setIsCancelRequested(true);
      return;
    }
    void runAction(async () => {
      const next = await accountBookings.cancel(booking.id, {
        reasonKey: cancelReasonKey ?? undefined,
        note: cancelNote.trim() || undefined,
      });
      setIsCancelConfirmOpen(false);
      onBookingChange?.(next);
    });
  };

  const openCancelPreview = () => {
    if (!booking || !isApiBooking) {
      setIsCancelConfirmOpen(true);
      return;
    }
    void runAction(async () => {
      const preview = await accountBookings.cancellationPreview(booking.id);
      setCancellationPreview(preview);
      setIsCancelConfirmOpen(true);
    });
  };

  const currentStepIndex = booking
    ? getBookingTimelineStepIndex(booking.status)
    : 0;
  const showCheckIn = booking
    ? (booking.status === "CONFIRMED" || booking.status === "CHECKED_IN") &&
      Boolean(booking.checkInCode)
    : false;
  const showPayAction = booking
    ? booking.status === "AWAITING_PAYMENT" &&
      (isApiBooking || Boolean(booking.invoiceId))
    : false;
  const showCancelAction = booking
    ? isApiBooking
      ? canManageBooking(booking.status)
      : (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
        !isCancelRequested
    : false;
  const showRescheduleAction = booking
    ? isApiBooking && canManageBooking(booking.status)
    : false;

  const detailRows = booking
    ? [
        { key: "date", label: t("date"), value: booking.dateLabel },
        { key: "time", label: t("time"), value: booking.timeLabel },
        {
          key: "location",
          label: t("location"),
          value: booking.locationLabel,
        },
        { key: "price", label: t("price"), value: booking.priceLabel },
      ]
    : [];

  return {
    t,
    router,
    booking,
    isApiBooking,
    isCancelConfirmOpen,
    setIsCancelConfirmOpen,
    isCancelRequested,
    cancelReasonKey,
    setCancelReasonKey,
    cancelNote,
    setCancelNote,
    isActing,
    actionError,
    cancellationPreview,
    currentStepIndex,
    showCheckIn,
    showPayAction,
    showCancelAction,
    showRescheduleAction,
    detailRows,
    onPay,
    onConfirmCancel,
    openCancelPreview,
  };
}

export type UseAthleteBookingDetailReturn = ReturnType<
  typeof useAthleteBookingDetail
>;
