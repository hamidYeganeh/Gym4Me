"use client";

import type { CoachSlot, CoachSlotsResponse } from "@repo/api";
import { useEffect, useMemo, useState } from "react";
import { discoveryCoachSlots } from "@/shared/lib/api";
import { formatTimeFa } from "@/shared/lib/booking-view";

export type CoachSlotView = {
  id: string;
  /** ISO date `YYYY-MM-DD` (local). */
  date: string;
  startsAt: string;
  endsAt: string;
  timeLabel: string;
  status: "available" | "unavailable";
  clubName: string | null;
  clubAddress: string | null;
  clubId: string | null;
};

export type CoachSlotDayView = {
  id: string;
  date: string;
  slots: CoachSlotView[];
};

function localDateIso(iso: string): string {
  const date = new Date(iso);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function mapSlotToView(slot: CoachSlot): CoachSlotView {
  const inFuture = new Date(slot.startsAt).getTime() > Date.now();
  return {
    id: slot.id,
    date: localDateIso(slot.startsAt),
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    timeLabel: formatTimeFa(slot.startsAt),
    status: slot.status === "open" && inFuture ? "available" : "unavailable",
    clubName: slot.club?.name ?? null,
    clubAddress: slot.club?.address ?? null,
    clubId: slot.club?.id ?? null,
  };
}

export function groupSlotsByDate(
  slots: CoachSlot[],
  fromIso: string,
  dayCount = 7,
): CoachSlotDayView[] {
  const byDate = new Map<string, CoachSlotView[]>();
  for (const slot of slots) {
    const view = mapSlotToView(slot);
    const bucket = byDate.get(view.date) ?? [];
    bucket.push(view);
    byDate.set(view.date, bucket);
  }

  const days: CoachSlotDayView[] = [];
  const [y, m, d] = fromIso.split("-").map(Number);
  for (let offset = 0; offset < dayCount; offset += 1) {
    const date = new Date(Date.UTC(y!, m! - 1, d! + offset, 12, 0, 0));
    const iso = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
    days.push({
      id: iso,
      date: iso,
      slots: (byDate.get(iso) ?? []).sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt),
      ),
    });
  }
  return days;
}

/**
 * Live coach availability for one week (`from` inclusive, 7 days).
 * Only fetches for real API coach ids; callers fall back to fixtures otherwise.
 */
export function useCoachSlotsWeek(
  coachUserId: string,
  fromIso: string,
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<CoachSlotsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!enabled || !coachUserId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const toIso = (() => {
      const [y, m, d] = fromIso.split("-").map(Number);
      const end = new Date(Date.UTC(y!, m! - 1, d! + 6, 12, 0, 0));
      return [
        end.getUTCFullYear(),
        String(end.getUTCMonth() + 1).padStart(2, "0"),
        String(end.getUTCDate()).padStart(2, "0"),
      ].join("-");
    })();

    discoveryCoachSlots
      .list(coachUserId, { from: fromIso, to: toIso })
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coachUserId, enabled, fromIso, refreshToken]);

  const days = useMemo(
    () => (data ? groupSlotsByDate(data.slots, fromIso) : []),
    [data, fromIso],
  );

  return {
    days,
    slots: useMemo(
      () => days.flatMap((day) => day.slots),
      [days],
    ),
    pricing: data?.pricing.consultation ?? null,
    isLoading,
    error,
    refresh: () => setRefreshToken((token) => token + 1),
  };
}
