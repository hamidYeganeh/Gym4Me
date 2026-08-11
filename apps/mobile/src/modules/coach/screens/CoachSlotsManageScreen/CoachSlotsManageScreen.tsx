"use client";

import { Button, Spinner, Typography } from "@heroui/react";
import { ApiError, type CoachSlot, type CoachSlotClub } from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { CloseX } from "@repo/icons/CloseX";
import { Plus } from "@repo/icons/Plus";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { coachSlots } from "@/shared/lib/api";
import { faDigits, formatTimeFa } from "@/shared/lib/booking-view";
import {
  addDaysIso,
  formatJalaliDateShort,
  formatJalaliRangeLabel,
  todayIso,
  weekdayKey,
  weekdaySat0,
  weekRangeContaining,
} from "@/shared/lib/week-calendar";
import { coachSlotsManageScreenStyles as styles } from "./CoachSlotsManageScreen.styles";

const START_TIMES = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
] as const;

const DURATIONS_MINUTES = [45, 60, 90] as const;

function localDateOf(iso: string): string {
  const date = new Date(iso);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function slotIso(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y!, m! - 1, d!, hh!, mm!, 0, 0).toISOString();
}

export function CoachSlotsManageScreen() {
  const t = useTranslations("CoachSlotsManage");
  const router = useRouter();

  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const range = weekRangeContaining(anchor);

  const [slots, setSlots] = useState<CoachSlot[] | null>(null);
  const [clubs, setClubs] = useState<CoachSlotClub[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create form
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

  const dayLabel = (date: string) =>
    `${t(`weekday.${weekdayKey(weekdaySat0(date))}`)} ${formatJalaliDateShort(date)}`;

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

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.form}>
          <Typography className={styles.formTitle} type="h4" weight="semibold">
            {t("newSlotTitle")}
          </Typography>

          <div className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel} type="body-sm">
              {t("dayLabel")}
            </Typography>
            <FilterChipBar aria-label={t("dayLabel")}>
              {days.map((day) => (
                <FilterChip
                  key={day.date}
                  onPress={() => setDraftDate(day.date)}
                  selected={draftDate === day.date}
                  selectedVariant="solid"
                >
                  {dayLabel(day.date)}
                </FilterChip>
              ))}
            </FilterChipBar>
          </div>

          <div className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel} type="body-sm">
              {t("timeLabel")}
            </Typography>
            <FilterChipBar aria-label={t("timeLabel")}>
              {START_TIMES.map((time) => (
                <FilterChip
                  key={time}
                  onPress={() => setDraftTime(time)}
                  selected={draftTime === time}
                  selectedVariant="solid"
                >
                  {faDigits(time)}
                </FilterChip>
              ))}
            </FilterChipBar>
          </div>

          <div className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel} type="body-sm">
              {t("durationLabel")}
            </Typography>
            <FilterChipBar aria-label={t("durationLabel")}>
              {DURATIONS_MINUTES.map((minutes) => (
                <FilterChip
                  key={minutes}
                  onPress={() => setDraftDuration(minutes)}
                  selected={draftDuration === minutes}
                  selectedVariant="solid"
                >
                  {t("durationMinutes", { minutes })}
                </FilterChip>
              ))}
            </FilterChipBar>
          </div>

          <div className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel} type="body-sm">
              {t("venueLabel")}
            </Typography>
            <FilterChipBar aria-label={t("venueLabel")}>
              <FilterChip
                onPress={() => setDraftClubId(null)}
                selected={draftClubId === null}
                selectedVariant="solid"
              >
                {t("venueRemote")}
              </FilterChip>
              {clubs.map((club) => (
                <FilterChip
                  key={club.id}
                  onPress={() => setDraftClubId(club.id)}
                  selected={draftClubId === club.id}
                  selectedVariant="solid"
                >
                  {club.name}
                </FilterChip>
              ))}
            </FilterChipBar>
            {clubs.length === 0 ? (
              <Typography className={styles.formHint} type="body-xs">
                {t("noClubsHint")}
              </Typography>
            ) : null}
          </div>

          <Button
            fullWidth
            isPending={isCreating}
            onPress={() => void onCreate()}
            size="lg"
            variant="primary"
          >
            <Plus size={18} />
            {t("createSlot")}
          </Button>

          {error ? (
            <Typography className={styles.errorText} type="body-sm">
              {error}
            </Typography>
          ) : null}
        </section>

        <div className={styles.weekRow}>
          <Typography className={styles.weekLabel} weight="bold">
            {formatJalaliRangeLabel(range.from, range.to)}
          </Typography>
          <div className={styles.weekNav}>
            <Button
              aria-label={t("prevWeek")}
              className={styles.weekButton}
              isIconOnly
              onPress={() => setAnchor(addDaysIso(range.from, -7))}
              size="lg"
            >
              <ChevronRight
                aria-hidden
                className={styles.weekButtonIcon}
                rtlMirror={false}
                size={18}
              />
            </Button>
            <Button
              aria-label={t("nextWeek")}
              className={styles.weekButton}
              isIconOnly
              onPress={() => setAnchor(addDaysIso(range.from, 7))}
              size="lg"
            >
              <ChevronLeft
                aria-hidden
                className={styles.weekButtonIcon}
                rtlMirror={false}
                size={18}
              />
            </Button>
          </div>
        </div>

        {slots === null ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : (
          <div className={styles.days}>
            {days.map((day) => (
              <div className={styles.day} key={day.date}>
                <Typography className={styles.dayLabel} weight="bold">
                  {dayLabel(day.date)}
                </Typography>
                {day.slots.length > 0 ? (
                  <div className={styles.slotsRow}>
                    {day.slots.map((slot) => (
                      <span
                        className={`${styles.slotChip} ${
                          slot.status === "open"
                            ? styles.slotOpen
                            : slot.status === "booked"
                              ? styles.slotBooked
                              : styles.slotBlocked
                        }`}
                        key={slot.id}
                      >
                        {formatTimeFa(slot.startsAt)}
                        {slot.club ? ` — ${slot.club.name}` : ""}
                        {slot.status === "open" ? (
                          <button
                            aria-label={t("removeSlot")}
                            className={styles.slotRemove}
                            onClick={() => void onRemove(slot.id)}
                            type="button"
                          >
                            <CloseX size={14} />
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Typography className={styles.emptyDay} type="body-sm">
                    {t("emptyDay")}
                  </Typography>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
