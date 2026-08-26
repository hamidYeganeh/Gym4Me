"use client";

import { Button } from "@heroui/react/button";
import { Calendar2 } from "@repo/icons/Calendar2";
import { Plus } from "@repo/icons/Plus";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import type { CoachCalendarWeek } from "../../lib/calendar-weekly-data";
import { CoachCalendarWeeklyDaysSection } from "../../sections/CoachCalendarWeeklyDaysSection";
import { CoachCalendarWeeklyWeekNavSection } from "../../sections/CoachCalendarWeeklyWeekNavSection";
import { coachCalendarWeeklyScreenStyles as styles } from "./CoachCalendarWeeklyScreen.styles";
import type { CoachCalendarWeeklyScreenProps } from "./CoachCalendarWeeklyScreen.types";

function cloneWeeks(weeks: CoachCalendarWeek[]): CoachCalendarWeek[] {
  return weeks.map((week) => ({
    ...week,
    days: week.days.map((day) => ({
      ...day,
      workouts: [...day.workouts],
    })),
  }));
}

export function CoachCalendarWeeklyScreen({
  weeks: initialWeeks,
  defaultWeekIndex = 0,
}: CoachCalendarWeeklyScreenProps) {
  const t = useTranslations("CoachCalendarWeekly");
  const router = useRouter();
  const [weeks, setWeeks] = useState(() => cloneWeeks(initialWeeks));
  const [weekIndex, setWeekIndex] = useState(() =>
    Math.min(Math.max(defaultWeekIndex, 0), Math.max(weeks.length - 1, 0)),
  );
  const [vaporizingWorkoutId, setVaporizingWorkoutId] = useState<string | null>(
    null,
  );

  const week = weeks[weekIndex] ?? weeks[0];
  const canGoPrevious = weekIndex > 0;
  const canGoNext = weekIndex < weeks.length - 1;

  if (!week) {
    return null;
  }

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
          endContent={
            <Button
              aria-label={t("calendar")}
              isIconOnly
              size="lg"
              variant="ghost"
            >
              <Calendar2 size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <CoachCalendarWeeklyWeekNavSection
          isNextDisabled={!canGoNext}
          isPreviousDisabled={!canGoPrevious}
          nextLabel={t("nextWeek")}
          onNextWeek={() => {
            if (canGoNext) {
              setVaporizingWorkoutId(null);
              setWeekIndex((index) => index + 1);
            }
          }}
          onPreviousWeek={() => {
            if (canGoPrevious) {
              setVaporizingWorkoutId(null);
              setWeekIndex((index) => index - 1);
            }
          }}
          previousLabel={t("previousWeek")}
          rangeLabel={t("weekRange", {
            start: week.startLabel,
            end: week.endLabel,
          })}
        />

        <CoachCalendarWeeklyDaysSection
          addLabel={t("add")}
          dayLabels={{
            saturday: t("saturday"),
            sunday: t("sunday"),
            monday: t("monday"),
            tuesday: t("tuesday"),
            wednesday: t("wednesday"),
            thursday: t("thursday"),
            friday: t("friday"),
          }}
          days={week.days}
          deleteLabel={t("deleteWorkout")}
          menuLabel={t("workoutMenu")}
          onDeleteWorkout={(workoutId) => {
            if (vaporizingWorkoutId != null) return;
            setVaporizingWorkoutId(workoutId);
          }}
          onVaporizeComplete={(workoutId) => {
            setWeeks((current) =>
              current.map((entry, index) => {
                if (index !== weekIndex) return entry;
                return {
                  ...entry,
                  days: entry.days.map((day) => ({
                    ...day,
                    workouts: day.workouts.filter(
                      (workout) => workout.id !== workoutId,
                    ),
                  })),
                };
              }),
            );
            setVaporizingWorkoutId(null);
          }}
          vaporizingWorkoutId={vaporizingWorkoutId}
        />
      </div>

      <Button
        aria-label={t("addWorkout")}
        className={styles.fab}
        isIconOnly
        size="lg"
        variant="primary"
      >
        <Plus size={24} />
      </Button>
    </AppLayout>
  );
}
