"use client";

import { Button } from "@heroui/react/button";
import { Calendar2 } from "@repo/icons/Calendar2";
import { Plus } from "@repo/icons/Plus";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import type { CoachCalendarDailyWorkout } from "../../lib/calendar-daily-data";
import { CoachCalendarDailyDatePickerSection } from "../../sections/CoachCalendarDailyDatePickerSection";
import { CoachCalendarDailyTimelineSection } from "../../sections/CoachCalendarDailyTimelineSection";
import { coachCalendarDailyScreenStyles as styles } from "./CoachCalendarDailyScreen.styles";
import type { CoachCalendarDailyScreenProps } from "./CoachCalendarDailyScreen.types";

export function CoachCalendarDailyScreen({
  days,
  slots,
  workouts: initialWorkouts,
  workoutsByDayId,
  defaultDayId,
}: CoachCalendarDailyScreenProps) {
  const t = useTranslations("CoachCalendarDaily");
  const router = useRouter();
  const [selectedDayId, setSelectedDayId] = useState(defaultDayId);
  const [workouts, setWorkouts] = useState<CoachCalendarDailyWorkout[]>(
    () => workoutsByDayId?.[defaultDayId] ?? initialWorkouts,
  );
  const [openWorkoutId, setOpenWorkoutId] = useState<string | null>(null);

  const selectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setOpenWorkoutId(null);
    if (workoutsByDayId) {
      setWorkouts(workoutsByDayId[dayId] ?? []);
    }
  };

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <CoachCalendarDailyDatePickerSection
          dayLabels={{
            sat: t("daySat"),
            sun: t("daySun"),
            mon: t("dayMon"),
            tue: t("dayTue"),
            wed: t("dayWed"),
            thu: t("dayThu"),
            fri: t("dayFri"),
          }}
          days={days}
          onSelectDay={selectDay}
          selectedDayId={selectedDayId}
        />

        <CoachCalendarDailyTimelineSection
          deleteLabel={t("deleteWorkout")}
          intensityLabels={{
            intense: t("intensityIntense"),
            normal: t("intensityNormal"),
            extreme: t("intensityExtreme"),
          }}
          onDeleteWorkout={(workoutId) => {
            setWorkouts((current) =>
              current.filter((workout) => workout.id !== workoutId),
            );
            setOpenWorkoutId(null);
          }}
          onOpenChange={setOpenWorkoutId}
          openWorkoutId={openWorkoutId}
          slots={slots}
          workouts={workouts}
        />
      </div>

      <Button
        aria-label={t("openWeekly")}
        className={styles.fab}
        isIconOnly
        onPress={() => router.push("/coach/calendar/weekly")}
        size="lg"
        variant="primary"
      >
        <Plus size={24} />
      </Button>
    </AppLayout>
  );
}
