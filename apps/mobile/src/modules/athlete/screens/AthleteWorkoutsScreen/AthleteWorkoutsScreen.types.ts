import type { AthleteWorkoutPlanItem } from "@/modules/athlete/lib/workout-programs-data";

export type AthleteWorkoutsScreenProps = {
  plans: AthleteWorkoutPlanItem[];
  className?: string;
};
