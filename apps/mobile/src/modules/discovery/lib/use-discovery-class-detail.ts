"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryClubSlots,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import {
  addDaysIso,
  todayIso,
} from "./club-calendar-data";
import { getClassDetail, type ClassDetail } from "./class-detail-data";
import { mapDiscoveryClassToDetail } from "./map-discovery-class";

type State = {
  classDetail: ClassDetail | null;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoveryClassDetail(
  clubId: string,
  classId: string,
): State {
  const useApi = isDiscoveryApiId(clubId) && isDiscoveryApiId(classId);
  const [state, setState] = useState<State>(() => {
    if (!useApi) {
      return {
        classDetail: getClassDetail(clubId, classId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      };
    }
    return {
      classDetail: null,
      isLoading: true,
      isError: false,
      source: "api",
    };
  });

  useEffect(() => {
    if (!useApi) {
      setState({
        classDetail: getClassDetail(clubId, classId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({
      ...prev,
      isLoading: true,
      isError: false,
      source: "api",
    }));

    void (async () => {
      try {
        const from = todayIso();
        const to = addDaysIso(from, 13);
        const [cls, calendar] = await Promise.all([
          discoveryClubSlots.getClass(clubId, classId),
          discoveryClubSlots.getCalendar(clubId, { from, to }).catch(() => null),
        ]);
        if (cancelled) return;
        setState({
          classDetail: mapDiscoveryClassToDetail(clubId, cls, calendar),
          isLoading: false,
          isError: false,
          source: "api",
        });
      } catch (error) {
        if (cancelled) return;
        const fallback = getClassDetail(clubId, classId) ?? null;
        setState({
          classDetail: fallback,
          isLoading: false,
          isError:
            !(error instanceof ApiError && error.status === 404) && !fallback,
          source: fallback ? "mock" : "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId, classId, useApi]);

  return state;
}
