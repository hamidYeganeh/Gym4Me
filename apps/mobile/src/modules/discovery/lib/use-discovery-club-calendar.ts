"use client";

import { useEffect, useState } from "react";
import type { ClubCalendarResponse } from "@repo/api/discovery";
import {
  discoveryClubSlots,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import {
  getMockClubCalendar,
} from "./club-calendar-data";

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
  const [data, setData] = useState<ClubCalendarResponse>(() =>
    getMockClubCalendar(clubId || "club", range.from, range.to),
  );
  const [isLoading, setIsLoading] = useState(useApi);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!useApi) {
      setData(getMockClubCalendar(clubId || "club", range.from, range.to));
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    void (async () => {
      try {
        const calendar = await discoveryClubSlots.getCalendar(clubId, range);
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
  }, [clubId, range.from, range.to, useApi]);

  return {
    data,
    isLoading,
    isError,
    source: useApi ? ("api" as const) : ("mock" as const),
  };
}
