"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { Waitlist } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { accountBookings, accountWaitlist } from "@/shared/lib/api";
import { useRouter } from "@/shared/lib/app-router";
import { getPaymentCallbackUrl } from "@/shared/lib/payment-return";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWaitlistScreen } from "../screens/AthleteWaitlistScreen";

export function AthleteWaitlistGate() {
  const t = useTranslations("AthleteWaitlist");
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Waitlist[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const page = await accountWaitlist.listMine({ page_size: 50 });
    setItems(page.result);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) {
        setError("load");
        setItems([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  useEffect(() => {
    if (!isAuthenticated || !items) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void reload().catch(() => setError("load"));
      }
    };
    const onVisibilityChange = () => refresh();
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const nextExpiry = items
      .flatMap((item) => item.entries)
      .filter(
        (entry) => entry.status === "offered" && entry.offerExpiresAt,
      )
      .map((entry) => new Date(entry.offerExpiresAt as string).getTime())
      .filter((expiresAt) => expiresAt > Date.now())
      .sort((a, b) => a - b)[0];
    const expiryTimer = nextExpiry
      ? window.setTimeout(refresh, Math.max(0, nextExpiry - Date.now() + 250))
      : undefined;

    return () => {
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (expiryTimer !== undefined) window.clearTimeout(expiryTimer);
    };
  }, [isAuthenticated, items, reload]);

  const handleLeave = useCallback(
    async (waitlistId: string) => {
      setPendingId(waitlistId);
      try {
        await accountWaitlist.leave(waitlistId);
        await reload();
      } catch {
        setError("mutation");
      } finally {
        setPendingId(null);
      }
    },
    [reload],
  );

  const handleClaim = useCallback(
    async (waitlistId: string, entryId: string) => {
      setPendingId(waitlistId);
      try {
        const result = await accountWaitlist.claim(waitlistId, { entryId });
        const booking = result.bookings[0];
        if (!booking) throw new Error("WAITLIST_BOOKING_MISSING");
        if (booking.status === "awaiting_payment") {
          const payment = await accountBookings.pay(
            booking.id,
            getPaymentCallbackUrl(`/athlete/bookings/${booking.id}`),
          );
          window.location.assign(payment.redirectUrl);
          return;
        }
        router.replace(`/athlete/bookings/${booking.id}`);
      } catch {
        setError("mutation");
      } finally {
        setPendingId(null);
      }
    },
    [router],
  );

  if (!items) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  if (error === "load") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
        <Typography type="body">{t("loadError")}</Typography>
        <button className="min-h-11 rounded-medium px-4 text-primary underline" onClick={() => void reload()} type="button">{t("retry")}</button>
      </div>
    );
  }

  return (
    <AthleteWaitlistScreen
      items={items}
      error={error === "mutation" ? t("mutationError") : null}
      onClaim={isAuthenticated ? handleClaim : undefined}
      onLeave={isAuthenticated ? handleLeave : undefined}
      pendingId={pendingId}
    />
  );
}
