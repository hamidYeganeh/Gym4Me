"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryClasses,
  discoveryClubSlots,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import {
  addDaysIso,
  todayIso,
} from "./club-calendar-data";
import {
  getClassDetailById,
  type ClassDetail,
} from "./class-detail-data";
import { mapDiscoveryClassToDetail } from "./map-discovery-class";

type State = {
  classDetail: ClassDetail | null;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

/** Global class detail hook for `/discovery/classes/:classId`. */
export function useDiscoveryClassDetailById(
  classId: string,
  clubIdHint?: string,
): State {
  const useApi = isDiscoveryApiId(classId);

  const [state, setState] = useState<State>(() => {
    if (!useApi) {
      return {
        classDetail:
          getClassDetailById(classId, clubIdHint) ??
          null,
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
        classDetail:
          getClassDetailById(classId, clubIdHint) ??
          null,
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
        const cls = await discoveryClasses.get(classId);
        const clubId = cls.clubId || clubIdHint?.trim() || "";
        const today = todayIso();
        const from = addDaysIso(today, -13);
        const to = addDaysIso(today, 13);
        const calendar = clubId
          ? await discoveryClubSlots
              .getCalendar(clubId, { from, to })
              .catch(() => null)
          : null;
        if (cancelled) return;
        setState({
          classDetail: mapDiscoveryClassToDetail(clubId, cls, calendar),
          isLoading: false,
          isError: false,
          source: "api",
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          classDetail: null,
          isLoading: false,
          isError: !(error instanceof ApiError && error.status === 404),
          source: "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [classId, clubIdHint, useApi]);

  return state;
}
