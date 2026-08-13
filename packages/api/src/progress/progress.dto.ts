import type { Paginated, Privacy, VerificationStatus } from "../types";

export type MetricValueKind =
  | "number"
  | "pair"
  | "range"
  | "ratio"
  | "text";

export type MetricTypeStatus = "active" | "archived";

export type WorkoutProgramStatus = "draft" | "published" | "archived";

export type WorkoutProgramOwnerType = "coach" | "admin" | "system";

export type WorkoutPlanStatus =
  | "draft"
  | "active"
  | "completed"
  | "archived";

export type ExerciseStatus = "active" | "archived";

export type ExerciseOriginKind = "system" | "admin" | "coach";

export type WorkoutLogStatus = "completed" | "skipped";

export type MetricType = {
  id: string;
  key: string;
  name: string;
  valueKind: MetricValueKind;
  unit: string | null;
  sportId: string | null;
  status: MetricTypeStatus;
  sortHint: number;
  chartKind: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListMetricTypesQuery = {
  page?: number;
  page_size?: number;
  search?: string;
};

export type WorkoutProgramMeta = {
  focusLabel: string | null;
  weekCount: number | null;
  sessionsPerWeek: number | null;
};

export type WorkoutProgram = {
  id: string;
  owner: { type: WorkoutProgramOwnerType; id: string | null };
  title: string;
  status: WorkoutProgramStatus;
  privacy: Privacy;
  meta: WorkoutProgramMeta;
  assignedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListWorkoutProgramsQuery = {
  page?: number;
  page_size?: number;
  status?: WorkoutProgramStatus;
};

export type CreateWorkoutProgramInput = {
  title: string;
  status?: WorkoutProgramStatus;
  privacy?: Privacy;
  meta?: {
    focusLabel?: string;
    weekCount?: number;
    sessionsPerWeek?: number;
  };
};

export type UpdateWorkoutProgramInput = Partial<CreateWorkoutProgramInput>;

export type AssignWorkoutProgramInput = {
  athleteUserId: string;
};

export type Exercise = {
  id: string;
  name: string;
  description: string | null;
  muscleKeys: string[];
  equipmentKeys: string[];
  mediaId: string | null;
  status: ExerciseStatus;
  origin: {
    kind: ExerciseOriginKind;
    userId: string | null;
  };
  verification: {
    status: VerificationStatus;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type ListExercisesQuery = {
  page?: number;
  page_size?: number;
  status?: ExerciseStatus;
  search?: string;
};

export type CreateExerciseInput = {
  name: string;
  description?: string;
  muscleKeys?: string[];
  equipmentKeys?: string[];
  mediaId?: string;
  status?: ExerciseStatus;
};

export type WorkoutPlanExerciseItem = {
  exerciseId: string;
  sets: number;
  reps: number | null;
  durationSec: number | null;
  note: string | null;
};

export type WorkoutPlanDay = {
  dayIndex: number;
  exercises: WorkoutPlanExerciseItem[];
};

export type WorkoutPlanWeek = {
  weekIndex: number;
  days: WorkoutPlanDay[];
};

export type WorkoutPlanPeriod = {
  start: string | null;
  end: string | null;
};

export type WorkoutPlan = {
  id: string;
  athleteUserId: string;
  coachUserId: string | null;
  programId: string | null;
  title: string;
  status: WorkoutPlanStatus;
  privacy: Privacy;
  weeks: WorkoutPlanWeek[];
  period: WorkoutPlanPeriod | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutPlanExerciseItemInput = {
  exerciseId: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  note?: string;
};

export type WorkoutPlanDayInput = {
  dayIndex: number;
  exercises: WorkoutPlanExerciseItemInput[];
};

export type WorkoutPlanWeekInput = {
  weekIndex: number;
  days: WorkoutPlanDayInput[];
};

export type WorkoutPlanPeriodInput = {
  start?: string;
  end?: string;
};

export type CreateWorkoutPlanInput = {
  athleteUserId?: string;
  title: string;
  status?: WorkoutPlanStatus;
  privacy?: Privacy;
  weeks?: WorkoutPlanWeekInput[];
  period?: WorkoutPlanPeriodInput;
};

export type UpdateWorkoutPlanInput = {
  title?: string;
  status?: WorkoutPlanStatus;
  privacy?: Privacy;
  weeks?: WorkoutPlanWeekInput[];
  period?: WorkoutPlanPeriodInput | null;
};

export type ListWorkoutPlansQuery = {
  page?: number;
  page_size?: number;
  status?: WorkoutPlanStatus;
  athleteUserId?: string;
};

export type ProgressMetric = {
  id: string;
  athleteUserId: string;
  privacy: Privacy;
  metricKey: string;
  value: number;
  unit: string | null;
  recordedAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProgressMetricInput = {
  metricKey: string;
  value: number;
  unit?: string;
  recordedAt: string;
  note?: string;
  privacy?: Privacy;
};

export type UpdateProgressMetricInput = {
  metricKey?: string;
  value?: number;
  unit?: string;
  recordedAt?: string;
  note?: string;
  privacy?: Privacy;
};

export type ListProgressMetricsQuery = {
  page?: number;
  page_size?: number;
  metricKey?: string;
};

export type ProgressPhoto = {
  id: string;
  athleteUserId: string;
  mediaId: string;
  privacy: Privacy;
  capturedAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProgressPhotoInput = {
  mediaId: string;
  capturedAt: string;
  note?: string;
  privacy?: Privacy;
};

export type UpdateProgressPhotoInput = {
  mediaId?: string;
  capturedAt?: string;
  note?: string;
  privacy?: Privacy;
};

export type ListProgressPhotosQuery = {
  page?: number;
  page_size?: number;
};

export type WorkoutLogSet = {
  exerciseId: string;
  reps: number;
  weightKg: number | null;
  rpe: number | null;
};

export type WorkoutLog = {
  id: string;
  planId: string;
  athleteId: string;
  sessionIndex: number;
  sets: WorkoutLogSet[];
  status: WorkoutLogStatus;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutLogSetInput = {
  exerciseId: string;
  reps: number;
  weightKg?: number;
  rpe?: number;
};

export type CreateWorkoutLogInput = {
  planId: string;
  sessionIndex: number;
  sets: WorkoutLogSetInput[];
  status: WorkoutLogStatus;
  loggedAt?: string;
};

export type ListWorkoutLogsQuery = {
  page?: number;
  page_size?: number;
  planId?: string;
  athleteId?: string;
  status?: WorkoutLogStatus;
};

export type PersonalRecord = {
  id: string;
  athleteId: string;
  metricTypeKey: string;
  value: number;
  achievedAt: string;
  privacy: Privacy;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePersonalRecordInput = {
  metricTypeKey: string;
  value: number;
  achievedAt?: string;
  privacy?: Privacy;
  note?: string;
};

export type ListPersonalRecordsQuery = {
  page?: number;
  page_size?: number;
  athleteId?: string;
  metricTypeKey?: string;
};

export type DeleteOk = { ok: true };

export type MetricTypesPage = Paginated<MetricType>;
export type WorkoutProgramsPage = Paginated<WorkoutProgram>;
export type ExercisesPage = Paginated<Exercise>;
export type WorkoutPlansPage = Paginated<WorkoutPlan>;
export type ProgressMetricsPage = Paginated<ProgressMetric>;
export type ProgressPhotosPage = Paginated<ProgressPhoto>;
export type WorkoutLogsPage = Paginated<WorkoutLog>;
export type PersonalRecordsPage = Paginated<PersonalRecord>;
