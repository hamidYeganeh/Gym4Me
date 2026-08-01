"use client";

import { ScheduleWorkoutCard } from "@repo/ui/cards/ScheduleWorkoutCard";
import { coachCalendarDailyTimelineSectionStyles as styles } from "./CoachCalendarDailyTimelineSection.styles";
import type { CoachCalendarDailyTimelineSectionProps } from "./CoachCalendarDailyTimelineSection.types";

export function CoachCalendarDailyTimelineSection({
  slots,
  workouts,
  intensityLabels,
  deleteLabel,
  openWorkoutId,
  onOpenChange,
  onDeleteWorkout,
  onWorkoutPress,
}: CoachCalendarDailyTimelineSectionProps) {
  const workoutsByHour = new Map(workouts.map((workout) => [workout.hour, workout]));

  return (
    <div className={styles.root}>
      <div aria-hidden className={styles.line} />

      {slots.map((slot) => {
        const workout = workoutsByHour.get(slot.hour);

        return (
          <div className={styles.row} key={slot.hour}>
            <div className={styles.timeWrap}>
              <span className={styles.time}>{slot.label}</span>
            </div>

            <div className={styles.cardWrap}>
              {workout ? (
                <ScheduleWorkoutCard
                  aria-label={workout.title}
                  category={workout.category}
                  deleteLabel={deleteLabel}
                  duration={workout.duration}
                  image={workout.image}
                  intensity={workout.intensity}
                  intensityLabel={intensityLabels[workout.intensity]}
                  isOpen={openWorkoutId === workout.id}
                  onDelete={() => onDeleteWorkout(workout.id)}
                  onOpenChange={(isOpen) =>
                    onOpenChange(isOpen ? workout.id : null)
                  }
                  onPress={() => onWorkoutPress?.(workout.id)}
                  title={workout.title}
                  trailing="chevron"
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
