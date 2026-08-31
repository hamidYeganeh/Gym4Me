"use client";

import { Spinner } from "@heroui/react/spinner";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { coachBookings } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachBookingsScreen } from "../screens/CoachBookingsScreen";
import {
  mapApiBookingToCoachRequest,
  type CoachBookingCopy,
} from "./api-coach-bookings";
import {
  COACH_BOOKING_REQUESTS,
  type CoachBookingAction,
  type CoachBookingRequest,
} from "./coach-bookings-data";

/** Client gate: live coach bookings for signed-in coaches, fixtures otherwise. */
export function CoachBookingsGate() {
  const t = useTranslations("CoachBookings");
  const { isAuthenticated, isReady, activeRole } = useAuth();
  const isLive = isAuthenticated && activeRole === "coach";

  const [bookings, setBookings] = useState<CoachBookingRequest[] | null>(null);
  const [error, setError] = useState<string>();

  const copy = useMemo<CoachBookingCopy>(
    () => ({
      inPersonType: t("typeInPerson"),
      remoteType: t("typeRemote"),
    }),
    [t],
  );

  const load = useCallback(async () => {
    setError(undefined);
    try {
      const result = await coachBookings.list({ page_size: 100 });
      setBookings(
        result.result.map((booking) =>
          mapApiBookingToCoachRequest(booking, copy),
        ),
      );
    } catch {
      setBookings([]);
      setError(t("loadError"));
    }
  }, [copy, t]);

  useEffect(() => {
    if (!isReady) return;
    if (!isLive) {
      setBookings(DEMO_MODE ? COACH_BOOKING_REQUESTS : []);
      return;
    }
    void load();
  }, [isLive, isReady, load]);

  const onAction = useCallback(
    async (bookingId: string, action: CoachBookingAction) => {
      if (action === "accept") await coachBookings.accept(bookingId);
      else if (action === "checkIn") await coachBookings.checkIn(bookingId);
      else if (action === "complete") await coachBookings.complete(bookingId);
      else if (action === "noShow") await coachBookings.markNoShow(bookingId);
      else {
        const preview = await coachBookings.cancellationPreview(bookingId);
        const confirmed = window.confirm(
          t("cancelConfirm", {
            amount: preview.refundAmount.toLocaleString("fa-IR"),
          }),
        );
        if (!confirmed) return;
        await coachBookings.cancel(bookingId, {
          reasonKey: "coach_rejected_or_cancelled",
        });
      }
      await load();
    },
    [load, t],
  );

  if (!bookings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachBookingsScreen
      bookings={bookings}
      error={error}
      onAction={isLive ? onAction : undefined}
      onRetry={isLive ? load : undefined}
    />
  );
}
