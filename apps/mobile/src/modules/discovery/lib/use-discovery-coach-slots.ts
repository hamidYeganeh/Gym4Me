"use client";

import type { CoachConsultationPricing } from "@repo/api/discovery";
import { useMemo } from "react";
import { isDiscoveryApiId } from "@/shared/lib/api";
import {
  useCoachSlotsWeek,
  type CoachSlotDayView,
  type CoachSlotView,
} from "@/shared/hooks/useCoachSlotsWeek";
import { weekRangeContaining } from "./club-calendar-data";
import type {
  CoachDetailConsultationType,
} from "./coach-detail-data";
import { getCoachSlotsWeek } from "./coach-slots-data";

export type DiscoveryCoachSlotsWeek = {
  days: CoachSlotDayView[];
  pricing: CoachConsultationPricing | null;
  isLoading: boolean;
  source: "api" | "mock";
  refresh: () => void;
};

const MOCK_PRICING: CoachConsultationPricing = {
  inPerson: 450_000,
  remote: 300_000,
};

function mockDayToView(coachId: string): (day: {
  id: string;
  date: string;
  slots: { id: string; timeLabel: string; status: "available" | "unavailable" }[];
}) => CoachSlotDayView {
  return (day) => ({
    id: day.id,
    date: day.date,
    slots: day.slots.map(
      (slot): CoachSlotView => ({
        id: slot.id,
        date: day.date,
        startsAt: `${day.date}T00:00:00`,
        endsAt: `${day.date}T00:00:00`,
        timeLabel: slot.timeLabel,
        status: slot.status,
        clubName: null,
        clubAddress: null,
        clubId: null,
      }),
    ),
  });
}

/** Coach availability week — live API for real coach ids, fixtures for demos. */
export function useDiscoveryCoachSlotsWeek(
  coachId: string,
  anchorIso: string,
): DiscoveryCoachSlotsWeek {
  const isApi = isDiscoveryApiId(coachId);
  const { from } = weekRangeContaining(anchorIso);
  const api = useCoachSlotsWeek(coachId, from, { enabled: isApi });

  const mockDays = useMemo(
    () =>
      isApi ? [] : getCoachSlotsWeek(coachId, anchorIso).map(mockDayToView(coachId)),
    [anchorIso, coachId, isApi],
  );

  if (!isApi) {
    return {
      days: mockDays,
      pricing: MOCK_PRICING,
      isLoading: false,
      source: "mock",
      refresh: () => undefined,
    };
  }

  return {
    days: api.days,
    pricing: api.pricing,
    isLoading: api.isLoading,
    source: "api",
    refresh: api.refresh,
  };
}

/** Build detail-page consultation options from live pricing. */
export function consultationTypesFromPricing(
  pricing: CoachConsultationPricing | null | undefined,
): CoachDetailConsultationType[] {
  if (!pricing) return [];
  const options: CoachDetailConsultationType[] = [];
  if (pricing.inPerson !== null && pricing.inPerson !== undefined) {
    options.push({
      id: "in-person",
      kind: "in-person",
      titleKey: "consultationInPerson",
      status: "available",
      statusKey: "consultationAvailableToday",
      price: pricing.inPerson,
    });
  }
  if (pricing.remote !== null && pricing.remote !== undefined) {
    options.push({
      id: "remote",
      kind: "remote",
      titleKey: "consultationRemote",
      status: "available",
      statusKey: "consultationAvailableToday",
      price: pricing.remote,
    });
  }
  return options;
}
