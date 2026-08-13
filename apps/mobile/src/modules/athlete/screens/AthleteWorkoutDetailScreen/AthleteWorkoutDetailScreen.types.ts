import type {
  AthleteWorkoutLogStatus,
  AthleteWorkoutPlanDetail,
} from "@/modules/athlete/lib/workout-programs-data";

export type AthleteWorkoutDetailScreenProps = {
  detail: AthleteWorkoutPlanDetail;
  pending?: boolean;
  onLogSession?: (status: AthleteWorkoutLogStatus) => Promise<void>;
  className?: string;
};
