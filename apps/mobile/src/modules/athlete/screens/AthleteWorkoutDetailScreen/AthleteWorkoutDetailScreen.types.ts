import type {
  AthleteWorkoutLogItem,
  AthleteWorkoutLogStatus,
  AthleteWorkoutPlanDetail,
} from "@/modules/athlete/lib/workout-programs-data";

export type AthleteWorkoutDetailScreenProps = {
  detail: AthleteWorkoutPlanDetail;
  activeSession?: AthleteWorkoutLogItem | null;
  pending?: boolean;
  error?: string | null;
  onStartSession?: () => Promise<void>;
  onAddSet?: (input: {
    exerciseId: string;
    reps: number;
    weightKg?: number;
  }) => Promise<void>;
  onCompleteSession?: () => Promise<void>;
  onLogSession?: (status: AthleteWorkoutLogStatus) => Promise<void>;
  className?: string;
};
