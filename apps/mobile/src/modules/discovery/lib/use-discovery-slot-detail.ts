"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryClubSlots,
  discoveryClubs,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { mapDiscoverySlotToDetail } from "./map-discovery-slot";
import { getSlotDetail, type SlotDetail } from "./slot-detail-data";

type State = {
  slotDetail: SlotDetail | null;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
};

export function useDiscoverySlotDetail(
  clubId: string,
  slotId: string,
): State {
  const useApi = isDiscoveryApiId(clubId) && isDiscoveryApiId(slotId);
  const [state, setState] = useState<State>(() => {
    if (!useApi) {
      return {
        slotDetail: getSlotDetail(clubId, slotId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      };
    }
    return {
      slotDetail: null,
      isLoading: true,
      isError: false,
      source: "api",
    };
  });

  useEffect(() => {
    if (!useApi) {
      setState({
        slotDetail: getSlotDetail(clubId, slotId) ?? null,
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
        const [slot, club] = await Promise.all([
          discoveryClubSlots.getSlot(clubId, slotId),
          discoveryClubs.get(clubId).catch(() => null),
        ]);
        if (cancelled) return;
        setState({
          slotDetail: mapDiscoverySlotToDetail(
            clubId,
            slot,
            club?.identity?.name,
          ),
          isLoading: false,
          isError: false,
          source: "api",
        });
      } catch (error) {
        if (cancelled) return;
        const fallback = getSlotDetail(clubId, slotId) ?? null;
        setState({
          slotDetail: fallback,
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
  }, [clubId, slotId, useApi]);

  return state;
}
