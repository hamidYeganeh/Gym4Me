"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@repo/api";
import {
  discoveryCoaches,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { addDaysIso, todayIso } from "./club-calendar-data";
import { formatJalaliDateShort } from "./club-calendar-data";
import {
  getCoachDetail,
  type CoachDetail,
  type CoachDetailAvailabilityDay,
} from "./coach-detail-data";
import { mapDiscoveryCoachToDetail } from "./map-discovery-coach";
import {
  consultationTypesFromPricing,
  useDiscoveryCoachSlotsWeek,
} from "./use-discovery-coach-slots";

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

  // Live availability + pricing enrich the API-backed detail page.
  const today = useMemo(() => todayIso(), []);
  const slotsWeek = useDiscoveryCoachSlotsWeek(coachId, today);

  const coach = useMemo(() => {
    if (!state.coach || state.source !== "api") return state.coach;

    const consultationTypes = consultationTypesFromPricing(slotsWeek.pricing);
    const tomorrow = addDaysIso(today, 1);
    const availabilityDays: CoachDetailAvailabilityDay[] = (
      [
        { dayKey: "today" as const, date: today },
        { dayKey: "tomorrow" as const, date: tomorrow },
      ] as const
    )
      .map(({ dayKey, date }): CoachDetailAvailabilityDay | null => {
        const day = slotsWeek.days.find((entry) => entry.date === date);
        if (!day || day.slots.length === 0) return null;
        return {
          id: date,
          dayKey,
          dateLabel:
            dayKey === "tomorrow" ? formatJalaliDateShort(date) : undefined,
          slots: day.slots.map((slot) => ({
            id: slot.id,
            timeLabel: slot.timeLabel,
            status: slot.status,
          })),
        };
      })
      .filter((day): day is CoachDetailAvailabilityDay => day !== null);

    return {
      ...state.coach,
      consultationTypes,
      availabilityDays,
    };
  }, [slotsWeek.days, slotsWeek.pricing, state.coach, state.source, today]);

  return { ...state, coach };
}
