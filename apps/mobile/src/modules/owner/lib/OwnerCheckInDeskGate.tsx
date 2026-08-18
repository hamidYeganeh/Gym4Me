"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useCallback, useEffect, useState } from "react";
import { accountCheckin, accountClubs } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerCheckInDeskScreen } from "../screens/OwnerCheckInDeskScreen";

export function OwnerCheckInDeskGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setClubId(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    accountClubs
      .list({ page_size: 1 })
      .then((clubs) => {
        if (!cancelled) setClubId(clubs.result[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setClubId(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  const handleSubmit = useCallback(
    async (code: string) => {
      if (!clubId) return;
      setPending(true);
      setMessage(null);
      setError(null);
      try {
        const checkIn = await accountCheckin.checkInByBookingCode(clubId, {
          code,
          method: "manual",
        });
        setMessage(`حضور ثبت شد · ${checkIn.id}`);
      } catch {
        setError("کد رزرو معتبر نیست یا حضور قبلاً ثبت شده است.");
      } finally {
        setPending(false);
      }
    },
    [clubId],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !clubId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center">
        <Typography type="body">باشگاهی برای میز پذیرش پیدا نشد.</Typography>
      </div>
    );
  }

  return (
    <OwnerCheckInDeskScreen
      error={error}
      message={message}
      onSubmit={handleSubmit}
      pending={pending}
    />
  );
}
