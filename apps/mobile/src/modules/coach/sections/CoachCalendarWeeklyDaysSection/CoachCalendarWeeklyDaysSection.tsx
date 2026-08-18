"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ScheduleWorkoutCard } from "@repo/ui/cards/ScheduleWorkoutCard";
import { Vaporize } from "@repo/ui/kit/Vaporize";
import { coachCalendarWeeklyDaysSectionStyles as styles } from "./CoachCalendarWeeklyDaysSection.styles";
import type { CoachCalendarWeeklyDaysSectionProps } from "./CoachCalendarWeeklyDaysSection.types";

export function CoachCalendarWeeklyDaysSection({
  days,
  dayLabels,
  addLabel,
  menuLabel,
  deleteLabel,
  vaporizingWorkoutId = null,
  onAddDay,
  onDeleteWorkout,
  onVaporizeComplete,
  onWorkoutPress,
}: CoachCalendarWeeklyDaysSectionProps) {
  return (
    <div className={styles.root}>
      {days.map((day) => (
        <section className={styles.dayBlock} key={day.id}>
          <div className={styles.dayHeader}>
            <Typography className={styles.dayTitle}>
              {dayLabels[day.dayKey]}
            </Typography>
            <Button onPress={() => onAddDay?.(day.id)} variant="ghost">
              {addLabel}
            </Button>
          </div>

          {day.workouts.length > 0 ? (
            <div className={styles.workouts}>
              {day.workouts.map((workout) => (
                <Vaporize
                  active={vaporizingWorkoutId === workout.id}
                  key={workout.id}
                  onComplete={() => onVaporizeComplete?.(workout.id)}
                  spread={20}
                  density={60}
                >
                  <ScheduleWorkoutCard
                    aria-label={workout.title}
                    category={workout.category}
                    deleteLabel={deleteLabel}
                    duration={workout.duration}
                    image={workout.image}
                    menuLabel={menuLabel}
                    onDelete={() => onDeleteWorkout?.(workout.id)}
                    onPress={() => onWorkoutPress?.(workout.id)}
                    title={workout.title}
                    trailing="menu"
                  />
                </Vaporize>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
