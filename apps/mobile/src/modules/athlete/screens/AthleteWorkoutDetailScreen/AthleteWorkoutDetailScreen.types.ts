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
    durationSec?: number;
    distanceM?: number;
    rpe?: number;
  }) => Promise<void>;
  onUpdateSet?: (
    index: number,
    input: {
      exerciseId: string;
      reps: number;
      weightKg?: number;
      durationSec?: number;
      distanceM?: number;
      rpe?: number;
    },
  ) => Promise<void>;
  onRemoveSet?: (index: number) => Promise<void>;
  onSaveSessionDetails?: (input: {
    note?: string;
    pain?: { score?: number; bodyAreaKeys?: string[] };
  }) => Promise<void>;
  onCompleteSession?: () => Promise<void>;
  onRetryOfflineSync?: () => Promise<void>;
  onDiscardOfflineChanges?: () => Promise<void>;
  onLogSession?: (status: AthleteWorkoutLogStatus) => Promise<void>;
  className?: string;
};
