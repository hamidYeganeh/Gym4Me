"use client";

import { useEffect, useState } from "react";
import type { ClubCalendarResponse } from "@repo/api/discovery";
import {
  discoveryClubSlots,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import { getMockClubCalendar } from "./club-calendar-data";

/**
 * Club calendar for discovery detail.
 * Live Mongo club ids hit `/discovery/clubs/:id/calendar`;
 * demo slugs keep the local mock calendar.
 */
export function useDiscoveryClubCalendar(
  clubId: string,
  range: { from: string; to: string },
) {
  const useApi = isDiscoveryApiId(clubId);
  const useDemo = isDiscoveryDemoId(clubId);
  const { from, to } = range;
  const [data, setData] = useState<ClubCalendarResponse>(() =>
    useDemo
      ? getMockClubCalendar(clubId || "club", from, to)
      : { timezone: "Asia/Tehran", days: [] },
  );
  const [isLoading, setIsLoading] = useState(useApi);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (useDemo) {
      setData(getMockClubCalendar(clubId || "club", from, to));
      setIsLoading(false);
      setIsError(false);
      return;
    }

    if (!useApi) {
      setData({ timezone: "Asia/Tehran", days: [] });
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    void (async () => {
      try {
        const calendar = await discoveryClubSlots.getCalendar(clubId, {
          from,
          to,
        });
        if (cancelled) return;
        setData(calendar);
        setIsLoading(false);
      } catch {
        if (cancelled) return;
        setData({ timezone: "Asia/Tehran", days: [] });
        setIsLoading(false);
        setIsError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId, from, to, useApi, useDemo]);

  return {
    data,
    isLoading,
    isError,
    source: useDemo ? ("mock" as const) : ("api" as const),
  };
}
