import type { CoachExercise } from "../../lib/coach-exercises-data";

export type CoachExerciseCreateInput = {
  name: string;
  muscleGroup: string;
  notes?: string;
};

export type CoachExercisesScreenProps = {
  exercises: CoachExercise[];
  submitting?: boolean;
  onSubmitExercise?: (input: CoachExerciseCreateInput) => void | Promise<void>;
};
