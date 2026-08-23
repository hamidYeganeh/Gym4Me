"use client";

import { useEffect, useState } from "react";
import {
  discoveryClubSlots,
  isDiscoveryApiId,
  isDiscoveryDemoId,
} from "@/shared/lib/api";
import { mapDiscoverySlotToListItem } from "./map-discovery-slot";
import { getClubSlots, type ClubSlotListItem } from "./slot-detail-data";

type State = {
  slots: ClubSlotListItem[];
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoveryClubSlots(
  clubId: string,
): State & { retry: () => void } {
  const useApi = isDiscoveryApiId(clubId);
  const useDemo = isDiscoveryDemoId(clubId);
  const [state, setState] = useState<State>(() => ({
    slots: useDemo ? getClubSlots(clubId) : [],
    isLoading: useApi,
    isError: false,
    source: useDemo ? "mock" : "api",
  }));
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (useDemo) {
      setState({
        slots: getClubSlots(clubId),
        isLoading: false,
        isError: false,
        source: "mock",
      });
      return;
    }

    if (!useApi) {
      setState({ slots: [], isLoading: false, isError: false, source: "api" });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, isError: false }));

    void (async () => {
      try {
        const res = await discoveryClubSlots.listSlots(clubId);
        if (cancelled) return;
        setState({
          slots: (res.result ?? []).map(mapDiscoverySlotToListItem),
          isLoading: false,
          isError: false,
          source: "api",
        });
      } catch {
        if (cancelled) return;
        setState({
          slots: [],
          isLoading: false,
          isError: true,
          source: "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId, refreshToken, useApi, useDemo]);

  return {
    ...state,
    retry: () => setRefreshToken((token) => token + 1),
  };
}
