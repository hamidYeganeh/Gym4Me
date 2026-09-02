"use client";

import { Spinner } from "@heroui/react/spinner";
import type { Booking } from "@repo/api";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  accountBookings,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteBookingDetailScreen } from "../screens/AthleteBookingDetailScreen";
import {
  mapApiBookingToAthleteBooking,
  type AthleteBookingCopy,
} from "./api-bookings";
import { getBooking, type AthleteBooking } from "./bookings-data";
import { useRouter } from "@/shared/lib/app-router";

type Props = {
  bookingId?: string;
};

/**
 * Client gate for one booking: explicit local demos may render fixtures; API
 * ids are fetched live. Also completes the payment gateway callback
 * (`?Authority=…&Status=OK|NOK`) before showing the result.
 */
export function AthleteBookingDetailGate({ bookingId }: Props) {
  const t = useTranslations("AthleteBookings");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isReady } = useAuth();
  const resolvedBookingId = bookingId ?? searchParams.get("bookingId") ?? "";

  const isApi = isDiscoveryApiId(resolvedBookingId);
  const isDemo = isDiscoveryDemoId(resolvedBookingId);
  const mockBooking = useMemo(
    () => (isDemo ? getBooking(resolvedBookingId) : undefined),
    [resolvedBookingId, isDemo],
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
          const verified = await accountBookings.verifyPayment(resolvedBookingId, {
            authority,
            status: gatewayStatus,
          });
          if (cancelled) return;
          applyApiBooking(verified);
          // Drop gateway params so refresh/back doesn't re-verify.
          router.replace(`/athlete/booking/detail?bookingId=${encodeURIComponent(resolvedBookingId)}`);
          return;
        }
        const fetched = await accountBookings.get(resolvedBookingId);
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
    resolvedBookingId,
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
