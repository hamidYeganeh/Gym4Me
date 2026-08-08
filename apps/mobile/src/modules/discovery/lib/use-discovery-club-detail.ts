"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryClubSlots,
  discoveryClubs,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { addDaysIso, todayIso } from "./club-calendar-data";
import { getClubDetail, type ClubDetail } from "./club-detail-data";
import { mapDiscoveryClubToDetail } from "./map-discovery-club";

type DiscoveryClubDetailState = {
  club: ClubDetail | null;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoveryClubDetail(clubId: string): DiscoveryClubDetailState {
  const [state, setState] = useState<DiscoveryClubDetailState>(() => {
    if (!isDiscoveryApiId(clubId)) {
      return {
        club: getClubDetail(clubId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      };
    }
    return {
      club: null,
      isLoading: true,
      isError: false,
      source: "api",
    };
  });

  useEffect(() => {
    if (!isDiscoveryApiId(clubId)) {
      setState({
        club: getClubDetail(clubId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, isError: false, source: "api" }));

    void (async () => {
      try {
        const from = todayIso();
        const to = addDaysIso(from, 13);
        const [club, branches, classes, reviews, calendar] = await Promise.all([
          discoveryClubs.get(clubId),
          discoveryClubs.listBranches(clubId),
          discoveryClubSlots.listClasses(clubId),
          discoveryClubs.listReviews(clubId, { page_size: 20 }),
          discoveryClubSlots
            .getCalendar(clubId, { from, to })
            .catch(() => null),
        ]);
        if (cancelled) return;
        setState({
          club: mapDiscoveryClubToDetail({
            club: club as never,
            branches: branches.result as never,
            classes: classes.result,
            calendar,
            reviews: reviews.result,
          }),
          isLoading: false,
          isError: false,
          source: "api",
        });
      } catch (error) {
        if (cancelled) return;
        const fallback = getClubDetail(clubId) ?? null;
        setState({
          club: fallback,
          isLoading: false,
          isError: !(error instanceof ApiError && error.status === 404) && !fallback,
          source: fallback ? "mock" : "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId]);

  return state;
}
