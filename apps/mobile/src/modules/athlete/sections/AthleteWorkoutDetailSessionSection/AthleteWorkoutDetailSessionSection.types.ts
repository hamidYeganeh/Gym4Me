import type {
  AthleteWorkoutLogItem,
  AthleteWorkoutLogStatus,
  AthleteWorkoutPlanExercise,
} from "@/modules/athlete/lib/workout-programs-data";

export type AthleteWorkoutDetailSessionSectionProps = {
  startSessionLabel: string;
  activeSessionLabel: string;
  exerciseLabel: string;
  repsLabel: string;
  weightKgLabel: string;
  addSetLabel: string;
  noSetsYetLabel: string;
  completeSessionLabel: string;
  markCompletedLabel: string;
  markSkippedLabel: string;
  logStatusLabel: (status: AthleteWorkoutLogStatus) => string;
  exerciseLabelFor: (exerciseId: string) => string;
  exercises: AthleteWorkoutPlanExercise[];
  activeSession?: AthleteWorkoutLogItem | null;
  exerciseId: string;
  reps: string;
  weightKg: string;
  pending?: boolean;
  error?: string | null;
  onStartSession?: () => void | Promise<void>;
  onAddSet?: (input: {
    exerciseId: string;
    reps: number;
    weightKg?: number;
  }) => void | Promise<void>;
  onCompleteSession?: () => void | Promise<void>;
  onLogSession?: (status: AthleteWorkoutLogStatus) => void | Promise<void>;
  onExerciseIdChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onWeightKgChange: (value: string) => void;
  className?: string;
};
