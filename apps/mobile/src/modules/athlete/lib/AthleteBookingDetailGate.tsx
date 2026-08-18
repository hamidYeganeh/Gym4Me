"use client";

import { Spinner } from "@heroui/react/spinner";
import type { Booking } from "@repo/api";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { accountBookings, isDiscoveryApiId } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteBookingDetailScreen } from "../screens/AthleteBookingDetailScreen";
import {
  mapApiBookingToAthleteBooking,
  type AthleteBookingCopy,
} from "./api-bookings";
import { getBooking, type AthleteBooking } from "./bookings-data";

type Props = {
  bookingId: string;
};

/**
 * Client gate for one booking: demo fixtures render immediately; API ids are
 * fetched live. Also completes the payment gateway callback
 * (`?Authority=…&Status=OK|NOK`) before showing the result.
 */
export function AthleteBookingDetailGate({ bookingId }: Props) {
  const t = useTranslations("AthleteBookings");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isReady } = useAuth();

  const isApi = isDiscoveryApiId(bookingId);
  const mockBooking = useMemo(
    () => (isApi ? undefined : getBooking(bookingId)),
    [bookingId, isApi],
  );

  const copy = useMemo<AthleteBookingCopy>(
    () => ({
      inPersonTitle: t("coachSessionInPerson"),
      remoteTitle: t("coachSessionRemote"),
      remoteLocation: t("remoteLocation"),
    }),
    [t],
  );

  const [booking, setBooking] = useState<AthleteBooking | undefined>(
    mockBooking,
  );
  const [isLoading, setIsLoading] = useState(isApi);

  const applyApiBooking = useCallback(
    (apiBooking: Booking) =>
      setBooking(mapApiBookingToAthleteBooking(apiBooking, copy)),
    [copy],
  );

  useEffect(() => {
    if (!isApi || !isReady) return;
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    const authority = searchParams.get("Authority");
    const gatewayStatus = searchParams.get("Status");

    const load = async () => {
      try {
        if (authority && (gatewayStatus === "OK" || gatewayStatus === "NOK")) {
          const verified = await accountBookings.verifyPayment(bookingId, {
            authority,
            status: gatewayStatus,
          });
          if (cancelled) return;
          applyApiBooking(verified);
          // Drop gateway params so refresh/back doesn't re-verify.
          router.replace(`/athlete/bookings/${bookingId}`);
          return;
        }
        const fetched = await accountBookings.get(bookingId);
        if (!cancelled) applyApiBooking(fetched);
      } catch {
        if (!cancelled) setBooking(undefined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    applyApiBooking,
    bookingId,
    isApi,
    isAuthenticated,
    isReady,
    router,
    searchParams,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteBookingDetailScreen
      booking={booking}
      onBookingChange={isApi ? applyApiBooking : undefined}
    />
  );
}
