"use client";

import { ApiError, type CoachSlot, type CoachSlotClub } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { coachSlots } from "@/shared/lib/api";
import {
  addDaysIso,
  formatJalaliDateShort,
  todayIso,
  weekdayKey,
  weekdaySat0,
  weekRangeContaining,
} from "@/shared/lib/week-calendar";
import { localDateOf, slotIso } from "./coach-slots-helpers";

export function useCoachSlotsManage() {
  const t = useTranslations("CoachSlotsManage");
  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const range = weekRangeContaining(anchor);

  const [slots, setSlots] = useState<CoachSlot[] | null>(null);
  const [clubs, setClubs] = useState<CoachSlotClub[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [draftDate, setDraftDate] = useState(today);
  const [draftTime, setDraftTime] = useState<string>("18:00");
  const [draftDuration, setDraftDuration] = useState<number>(60);
  const [draftClubId, setDraftClubId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const load = useCallback(async () => {
    const response = await coachSlots.list({ from: range.from, to: range.to });
    setSlots(response.slots);
  }, [range.from, range.to]);

  useEffect(() => {
    setSlots(null);
    load().catch(() => {
      setSlots([]);
      setError(t("loadError"));
    });
  }, [load, t]);

  useEffect(() => {
    coachSlots
      .clubs()
      .then(setClubs)
      .catch(() => setClubs([]));
  }, []);

  const days = useMemo(() => {
    const grouped = new Map<string, CoachSlot[]>();
    for (const slot of slots ?? []) {
      const date = localDateOf(slot.startsAt);
      grouped.set(date, [...(grouped.get(date) ?? []), slot]);
    }
    return Array.from({ length: 7 }, (_, offset) => {
      const date = addDaysIso(range.from, offset);
      return {
        date,
        slots: (grouped.get(date) ?? []).sort((a, b) =>
          a.startsAt.localeCompare(b.startsAt),
        ),
      };
    });
  }, [range.from, slots]);

  const dayLabel = useCallback(
    (date: string) =>
      `${t(`weekday.${weekdayKey(weekdaySat0(date))}`)} ${formatJalaliDateShort(date)}`,
    [t],
  );

  const onCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const startsAt = slotIso(draftDate, draftTime);
      const endsAt = new Date(
        new Date(startsAt).getTime() + draftDuration * 60_000,
      ).toISOString();
      await coachSlots.create({
        slots: [{ startsAt, endsAt, clubId: draftClubId }],
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("createError"));
    } finally {
      setIsCreating(false);
    }
  };

  const onRemove = async (slotId: string) => {
    setError(null);
    try {
      await coachSlots.remove(slotId);
      setSlots((prev) => prev?.filter((slot) => slot.id !== slotId) ?? prev);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("removeError"));
    }
  };

  return {
    t,
    range,
    slots,
    clubs,
    days,
    error,
    draftDate,
    draftTime,
    draftDuration,
    draftClubId,
    isCreating,
    dayLabel,
    setAnchor,
    setDraftDate,
    setDraftTime,
    setDraftDuration,
    setDraftClubId,
    onCreate,
    onRemove,
  };
}

export type UseCoachSlotsManageReturn = ReturnType<typeof useCoachSlotsManage>;
