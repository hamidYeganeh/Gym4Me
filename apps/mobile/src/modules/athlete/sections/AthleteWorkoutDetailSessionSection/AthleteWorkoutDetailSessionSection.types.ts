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
  durationSecLabel: string;
  distanceMLabel: string;
  rpeLabel: string;
  painScoreLabel: string;
  painAreasLabel: string;
  painAreasHint: string;
  sessionNoteLabel: string;
  saveSessionDetailsLabel: string;
  addSetLabel: string;
  saveSetLabel: string;
  editSetLabel: string;
  removeSetLabel: string;
  cancelEditLabel: string;
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
  durationSec: string;
  distanceM: string;
  rpe: string;
  painScore: string;
  painAreas: string;
  sessionNote: string;
  pending?: boolean;
  error?: string | null;
  onStartSession?: () => void | Promise<void>;
  onAddSet?: (input: {
    exerciseId: string;
    reps: number;
    weightKg?: number;
    durationSec?: number;
    distanceM?: number;
    rpe?: number;
  }) => void | Promise<void>;
  editingSetIndex?: number | null;
  onEditSet?: (index: number) => void;
  onRemoveSet?: (index: number) => void | Promise<void>;
  onCancelEdit?: () => void;
  onSaveSessionDetails?: (input: {
    note?: string;
    pain?: { score?: number; bodyAreaKeys?: string[] };
  }) => void | Promise<void>;
  onCompleteSession?: () => void | Promise<void>;
  onLogSession?: (status: AthleteWorkoutLogStatus) => void | Promise<void>;
  onExerciseIdChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onWeightKgChange: (value: string) => void;
  onDurationSecChange: (value: string) => void;
  onDistanceMChange: (value: string) => void;
  onRpeChange: (value: string) => void;
  onPainScoreChange: (value: string) => void;
  onPainAreasChange: (value: string) => void;
  onSessionNoteChange: (value: string) => void;
  className?: string;
};
