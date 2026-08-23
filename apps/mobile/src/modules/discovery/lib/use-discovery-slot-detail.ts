"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryClubSlots,
  discoveryClubs,
  isDiscoveryApiId,
  isDiscoveryDemoId,
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
): State & { retry: () => void } {
  const useApi = isDiscoveryApiId(clubId) && isDiscoveryApiId(slotId);
  const useDemo = isDiscoveryDemoId(clubId) && isDiscoveryDemoId(slotId);
  const [state, setState] = useState<State>(() => {
    if (useDemo) {
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
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (useDemo) {
      setState({
        slotDetail: getSlotDetail(clubId, slotId) ?? null,
        isLoading: false,
        isError: false,
        source: "mock",
      });
      return;
    }

    if (!useApi) {
      setState({
        slotDetail: null,
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
        setState({
          slotDetail: null,
          isLoading: false,
          isError: !(error instanceof ApiError && error.status === 404),
          source: "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId, refreshToken, slotId, useApi, useDemo]);

  return {
    ...state,
    retry: () => setRefreshToken((token) => token + 1),
  };
}
