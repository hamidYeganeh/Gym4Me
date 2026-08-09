"use client";

import { useEffect, useState } from "react";
import {
  discoveryClubSlots,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { mapDiscoverySlotToListItem } from "./map-discovery-slot";
import { getClubSlots, type ClubSlotListItem } from "./slot-detail-data";

type State = {
  slots: ClubSlotListItem[];
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoveryClubSlots(clubId: string): State {
  const useApi = isDiscoveryApiId(clubId);
  const [state, setState] = useState<State>(() => ({
    slots: useApi ? [] : getClubSlots(clubId),
    isLoading: useApi,
    isError: false,
    source: useApi ? "api" : "mock",
  }));

  useEffect(() => {
    if (!useApi) {
      setState({
        slots: getClubSlots(clubId),
        isLoading: false,
        isError: false,
        source: "mock",
      });
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
          slots: getClubSlots(clubId),
          isLoading: false,
          isError: true,
          source: "mock",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId, useApi]);

  return state;
}
