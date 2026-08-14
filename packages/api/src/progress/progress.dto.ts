import type { Paginated, Privacy, VerificationStatus } from "../types";

export type MetricValueKind =
  | "number"
  | "pair"
  | "range"
  | "ratio"
  | "text";

export type MetricTypeStatus = "draft" | "active" | "archived";

export type WorkoutProgramStatus = "draft" | "published" | "archived";

export type WorkoutProgramOwnerType = "coach" | "admin" | "system";

export type WorkoutPlanStatus =
  | "draft"
  | "active"
  | "completed"
  | "archived";

export type ExerciseStatus = "active" | "archived";

export type ExerciseOriginKind = "system" | "admin" | "coach";

export type WorkoutLogStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "skipped"
  | "abandoned";

export type MetricSource =
  | "manual"
  | "apple_health"
  | "health_connect"
  | "import";

export type MetricAggregation =
  | "latest"
  | "sum"
  | "average"
  | "min"
  | "max";

export type MetricPeriodKind = "point" | "interval" | "daily-total";

export type MetricPrivacyClass = "wellness" | "health" | "sensitive";

export type MetricGoalPeriod = "daily" | "weekly" | "rolling_7d";

export type MetricGoalStatus =
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type MetricGoalOperator = "gte" | "lte" | "eq";

export type MetricReminderStatus = "active" | "paused" | "archived";

export type MetricReminderChannel = "push" | "in_app";

export type AthleteDataGrantStatus = "active" | "revoked" | "expired";

export type AthleteDataGranteeType = "coach";

export type AthleteDataGrantScope =
  | "metrics.weight"
  | "metrics.sleep"
  | "metrics.steps"
  | "metrics.water"
  | "metrics.walking"
  | "metrics.*"
  | "workouts.logs"
  | "progress.photos"
  | "progress.personal_records";

export type HealthSyncProvider = "apple_health" | "health_connect";

export type HealthSyncStatus =
  | "connected"
  | "paused"
  | "disconnected"
  | "error";

export type MetricTypeValidation = {
  min: number | null;
  max: number | null;
  step: number | null;
  integer: boolean;
};

export type MetricType = {
  id: string;
  key: string;
  name: string;
  valueKind: MetricValueKind;
  unit: string | null;
  canonicalUnit: string | null;
  validation: MetricTypeValidation | null;
  aggregation: MetricAggregation;
  periodKind: MetricPeriodKind;
  privacyClass: MetricPrivacyClass;
  sourceMappings: Record<string, string> | null;
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
  source: MetricSource;
  sourceRecordId: string | null;
  clientMutationId: string | null;
  period: { start: string | null; end: string | null } | null;
  periodStartAt: string | null;
  periodEndAt: string | null;
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
  source?: MetricSource;
  sourceRecordId?: string;
  clientMutationId?: string;
  period?: { start?: string; end?: string };
  periodStartAt?: string;
  periodEndAt?: string;
};

export type SyncProgressMetricInput = {
  metricKey: string;
  value: number;
  unit?: string;
  recordedAt: string;
  note?: string;
  privacy?: Privacy;
  source: MetricSource;
  sourceRecordId?: string;
  clientMutationId?: string;
  period?: { start?: string; end?: string };
  periodStartAt?: string;
  periodEndAt?: string;
};

export type SyncProgressMetricsInput = {
  entries: SyncProgressMetricInput[];
};

export type SyncProgressMetricsResult = {
  accepted: number;
  created: number;
  deduplicated: number;
  rejected: {
    index: number;
    reason: string;
    clientMutationId?: string;
    sourceRecordId?: string;
  }[];
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
  source?: MetricSource;
  from?: string;
  to?: string;
  athleteUserId?: string;
};

export type MetricsSummaryQuery = {
  from?: string;
  to?: string;
  metricKeys?: string[];
  athleteUserId?: string;
};

export type MetricsSummaryItem = {
  metricKey: string;
  aggregation: MetricAggregation;
  unit: string | null;
  sampleCount: number;
  value: number | null;
  latestRecordedAt: string | null;
};

export type MetricsSummaryResult = {
  from: string | null;
  to: string | null;
  items: MetricsSummaryItem[];
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
  durationSec: number | null;
  distanceM: number | null;
  rpe: number | null;
};

export type WorkoutLogTiming = {
  startedAt: string | null;
  completedAt: string | null;
  durationSec: number | null;
};

export type WorkoutLogPain = {
  score: number | null;
  bodyAreaKeys: string[];
};

export type WorkoutLog = {
  id: string;
  planId: string;
  planRevisionId: string | null;
  athleteId: string;
  sessionIndex: number;
  sets: WorkoutLogSet[];
  status: WorkoutLogStatus;
  timing: WorkoutLogTiming | null;
  note: string | null;
  pain: WorkoutLogPain | null;
  clientMutationId: string | null;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutLogSetInput = {
  exerciseId: string;
  reps: number;
  weightKg?: number;
  durationSec?: number;
  distanceM?: number;
  rpe?: number;
};

export type CreateWorkoutLogInput = {
  planId: string;
  planRevisionId?: string;
  sessionIndex: number;
  sets?: WorkoutLogSetInput[];
  status?: WorkoutLogStatus;
  timing?: {
    startedAt?: string;
    completedAt?: string;
    durationSec?: number;
  };
  note?: string;
  pain?: { score?: number; bodyAreaKeys?: string[] };
  clientMutationId?: string;
  loggedAt?: string;
};

export type UpdateWorkoutLogInput = {
  sets?: WorkoutLogSetInput[];
  status?: WorkoutLogStatus;
  timing?: {
    startedAt?: string;
    completedAt?: string;
    durationSec?: number;
  };
  note?: string | null;
  pain?: { score?: number; bodyAreaKeys?: string[] } | null;
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

export type MetricGoal = {
  id: string;
  athleteUserId: string;
  metricKey: string;
  target: {
    operator: MetricGoalOperator;
    value: number;
    unit: string | null;
  };
  period: MetricGoalPeriod;
  effective: { start: string; end: string | null };
  status: MetricGoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateMetricGoalInput = {
  metricKey: string;
  target: {
    operator: MetricGoalOperator;
    value: number;
    unit?: string;
  };
  period: MetricGoalPeriod;
  effective: { start: string; end?: string };
  status?: MetricGoalStatus;
};

export type UpdateMetricGoalInput = {
  target?: CreateMetricGoalInput["target"];
  period?: MetricGoalPeriod;
  effective?: CreateMetricGoalInput["effective"];
  status?: MetricGoalStatus;
};

export type ListMetricGoalsQuery = {
  page?: number;
  page_size?: number;
  metricKey?: string;
  status?: MetricGoalStatus;
};

export type MetricReminder = {
  id: string;
  athleteUserId: string;
  metricKey: string;
  schedule: {
    timezone: string;
    weekdays: number[];
    localTime: string;
  };
  quietHours: { start: string | null; end: string | null } | null;
  channel: MetricReminderChannel;
  status: MetricReminderStatus;
  createdAt: string;
  updatedAt: string;
};

export type UpsertMetricReminderInput = {
  schedule: {
    timezone: string;
    weekdays?: number[];
    localTime: string;
  };
  quietHours?: { start?: string; end?: string } | null;
  channel?: MetricReminderChannel;
  status?: MetricReminderStatus;
};

export type ListMetricRemindersQuery = {
  page?: number;
  page_size?: number;
  status?: MetricReminderStatus;
};

export type AthleteDataGrant = {
  id: string;
  athleteUserId: string;
  grantee: { type: AthleteDataGranteeType; userId: string };
  relationshipId: string;
  scopes: AthleteDataGrantScope[];
  effective: { grantedAt: string; expiresAt: string | null };
  status: AthleteDataGrantStatus;
  revokedAt: string | null;
  revokedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAthleteDataGrantInput = {
  granteeUserId: string;
  relationshipId: string;
  scopes: AthleteDataGrantScope[];
  expiresAt?: string;
};

export type ListAthleteDataGrantsQuery = {
  page?: number;
  page_size?: number;
  status?: AthleteDataGrantStatus;
};

export type HealthSyncState = {
  id: string;
  athleteUserId: string;
  provider: HealthSyncProvider;
  status: HealthSyncStatus;
  authorizedMetricKeys: string[];
  cursorByMetric: Record<string, string>;
  lastSyncAt: string | null;
  lastErrorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertHealthSyncStateInput = {
  status: HealthSyncStatus;
  authorizedMetricKeys?: string[];
  cursorByMetric?: Record<string, string>;
  lastSyncAt?: string;
  lastErrorCode?: string | null;
};

export type ListHealthSyncStatesQuery = {
  provider?: HealthSyncProvider;
};

export type HealthSyncStatesResult = {
  items: HealthSyncState[];
};

export type ProgressExportPayload = {
  exportedAt: string;
  athleteUserId: string;
  metrics: ProgressMetric[];
  photos: ProgressPhoto[];
  grants: AthleteDataGrant[];
  goals: MetricGoal[];
  reminders: MetricReminder[];
  healthSync: HealthSyncState[];
};

export type DeleteProgressMetricsInput = {
  confirmation: "DELETE_METRICS";
  metricKeys?: string[];
};

export type DeleteProgressMetricsResult = {
  ok: true;
  deletedCount: number;
};

export type ConsentHistoryEvent = {
  type: "granted" | "revoked" | "expired";
  occurredAt: string;
  grantId: string;
  granteeUserId: string;
  scopes: AthleteDataGrantScope[];
  status: AthleteDataGrantStatus;
};

export type ConsentHistoryResult = {
  items: ConsentHistoryEvent[];
  grants: AthleteDataGrant[];
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
export type MetricGoalsPage = Paginated<MetricGoal>;
export type MetricRemindersPage = Paginated<MetricReminder>;
export type AthleteDataGrantsPage = Paginated<AthleteDataGrant>;
