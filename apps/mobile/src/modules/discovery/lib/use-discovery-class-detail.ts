"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryClubSlots,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import { addDaysIso, todayIso } from "./club-calendar-data";
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
): State & { retry: () => void } {
  const useApi = isDiscoveryApiId(clubId) && isDiscoveryApiId(classId);
  const useDemo = isDiscoveryDemoId(clubId) && isDiscoveryDemoId(classId);
  const [state, setState] = useState<State>(() => {
    if (useDemo) {
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
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (useDemo) {
      setState({
        classDetail: getClassDetail(clubId, classId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      });
      return;
    }

    if (!useApi) {
      setState({
        classDetail: null,
        isLoading: false,
        isError: false,
        source: "api",
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
        const today = todayIso();
        // Include a past window so the sessions knob can show passed vs left.
        const from = addDaysIso(today, -13);
        const to = addDaysIso(today, 13);
        const [cls, calendar] = await Promise.all([
          discoveryClubSlots.getClass(clubId, classId),
          discoveryClubSlots
            .getCalendar(clubId, { from, to })
            .catch(() => null),
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
  }, [classId, clubId, refreshToken, useApi, useDemo]);

  return {
    ...state,
    retry: () => setRefreshToken((token) => token + 1),
  };
}
