"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryCoaches,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import {
  getCoachDetail,
  type CoachDetail,
} from "./coach-detail-data";
import { mapDiscoveryCoachToDetail } from "./map-discovery-coach";

type DiscoveryCoachDetailState = {
  coach: CoachDetail | null;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoveryCoachDetail(
  coachId: string,
): DiscoveryCoachDetailState & { retry: () => void } {
  const [state, setState] = useState<DiscoveryCoachDetailState>(() => {
    if (isDiscoveryDemoId(coachId)) {
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
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (isDiscoveryDemoId(coachId)) {
      setState({
        coach: getCoachDetail(coachId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      });
      return;
    }

    if (!isDiscoveryApiId(coachId)) {
      setState({
        coach: null,
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
        setState({
          coach: null,
          isLoading: false,
          isError: !(error instanceof ApiError && error.status === 404),
          source: "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coachId, refreshToken]);

  return {
    ...state,
    retry: () => setRefreshToken((token) => token + 1),
  };
}
