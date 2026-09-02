"use client";

import {
  useIssueAccessPassesMutation,
  useMyBookingsQuery,
} from "@repo/api/v2";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { accountCheckin } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteQrCheckInScreen } from "../screens/AthleteQrCheckInScreen";
import {
  DEFAULT_QR_CHECKIN,
  refreshQrCode,
  type QrCheckInState,
} from "./athlete-qr-checkin-data";

export function AthleteQrCheckInGate() {
  const { isAuthenticated, isReady } = useAuth();
  const searchParams = useSearchParams();
  const requestedBookingId = searchParams.get("bookingId");
  const bookingsQuery = useMyBookingsQuery(
    { status: "confirmed", limit: 100 },
    { enabled: !DEMO_MODE && isReady && isAuthenticated },
  );
  const issuePass = useIssueAccessPassesMutation();
  const issuedFor = useRef<string | null>(null);
  const [state, setState] = useState<QrCheckInState>(
    DEMO_MODE
      ? DEFAULT_QR_CHECKIN
      : { code: "—", expiresAtLabel: "در دسترس نیست", recentCheckIns: [] },
  );
  const [pending, setPending] = useState(false);

  const booking = useMemo(() => {
    const bookings = bookingsQuery.data?.items ?? [];
    return (
      bookings.find((item) =>
        requestedBookingId
          ? String(item._id ?? item.id) === requestedBookingId
          : item.status === "confirmed",
      ) ?? null
    );
  }, [bookingsQuery.data?.items, requestedBookingId]);

  const issue = useCallback(async () => {
    if (!booking) return;
    setPending(true);
    try {
      const result = await issuePass.mutateAsync({
        bookingId: String(booking._id ?? booking.id),
      });
      const issued = result[0];
      if (!issued) return;
      const from = new Date(issued.pass.validity.startsAt).toLocaleString("fa-IR-u-ca-persian");
      const to = new Date(issued.pass.validity.endsAt).toLocaleString("fa-IR-u-ca-persian");
      setState((current) => ({
        ...current,
        code: issued.token,
        expiresAtLabel: `معتبر از ${from} تا ${to}`,
      }));
    } finally {
      setPending(false);
    }
  }, [booking, issuePass]);

  useEffect(() => {
    if (DEMO_MODE || !booking) return;
    const bookingId = String(booking._id ?? booking.id);
    if (issuedFor.current === bookingId) return;
    issuedFor.current = bookingId;
    void issue();
  }, [booking, issue]);

  useEffect(() => {
    if (DEMO_MODE || !isReady || !isAuthenticated) return;
    let cancelled = false;
    accountCheckin.listMine({ page_size: 10 }).then((page) => {
      if (cancelled) return;
      setState((current) => ({
        ...current,
        recentCheckIns: page.result.map((item) => ({
          id: item.id,
          clubName: `شعبه ${item.clubId.slice(-6)}`,
          checkedInAtLabel: new Date(item.occurredAt).toLocaleString("fa-IR-u-ca-persian"),
          status: "success" as const,
        })),
      }));
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [isAuthenticated, isReady]);

  const onDemoRefresh = useCallback(async () => {
    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setState((current) => ({ ...current, ...refreshQrCode() }));
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthleteQrCheckInScreen
      code={state.code}
      expiresAtLabel={state.expiresAtLabel}
      onRefresh={DEMO_MODE ? onDemoRefresh : booking ? issue : undefined}
      pending={pending}
      recentCheckIns={state.recentCheckIns}
    />
  );
}
