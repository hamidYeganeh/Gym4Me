"use client";

import { Spinner } from "@heroui/react/spinner";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { accountBookings } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteBookingsScreen } from "../screens/AthleteBookingsScreen";
import {
  mapApiBookingToAthleteBooking,
  type AthleteBookingCopy,
} from "./api-bookings";
import { ATHLETE_BOOKINGS, type AthleteBooking } from "./bookings-data";

/**
 * Client gate: live bookings for signed-in athletes, demo fixtures otherwise
 * (screens keep pure props per the mocks-replaceable rule).
 */
export function AthleteBookingsGate() {
  const t = useTranslations("AthleteBookings");
  const { isAuthenticated, isReady } = useAuth();
  const [bookings, setBookings] = useState<AthleteBooking[] | null>(null);

  const copy = useMemo<AthleteBookingCopy>(
    () => ({
      inPersonTitle: t("coachSessionInPerson"),
      remoteTitle: t("coachSessionRemote"),
      remoteLocation: t("remoteLocation"),
    }),
    [t],
  );

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setBookings(ATHLETE_BOOKINGS);
      return;
    }
    let cancelled = false;
    accountBookings
      .list({ page_size: 100 })
      .then((result) => {
        if (cancelled) return;
        setBookings(
          result.result.map((booking) =>
            mapApiBookingToAthleteBooking(booking, copy),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setBookings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [copy, isAuthenticated, isReady]);

  if (!bookings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AthleteBookingsScreen bookings={bookings} />;
}
