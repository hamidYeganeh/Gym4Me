"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryCoaches,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { getCoachDetail, type CoachDetail } from "./coach-detail-data";
import { mapDiscoveryCoachToDetail } from "./map-discovery-coach";

type DiscoveryCoachDetailState = {
  coach: CoachDetail | null;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoveryCoachDetail(
  coachId: string,
): DiscoveryCoachDetailState {
  const [state, setState] = useState<DiscoveryCoachDetailState>(() => {
    if (!isDiscoveryApiId(coachId)) {
      return {
        coach: getCoachDetail(coachId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      };
    }
    return {
      coach: null,
      isLoading: true,
      isError: false,
      source: "api",
    };
  });

  useEffect(() => {
    if (!isDiscoveryApiId(coachId)) {
      setState({
        coach: getCoachDetail(coachId) ?? null,
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
        const coach = await discoveryCoaches.get(coachId);
        if (cancelled) return;
        setState({
          coach: mapDiscoveryCoachToDetail(coach),
          isLoading: false,
          isError: false,
          source: "api",
        });
      } catch (error) {
        if (cancelled) return;
        const fallback = getCoachDetail(coachId) ?? null;
        setState({
          coach: fallback,
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
  }, [coachId]);

  return state;
}
