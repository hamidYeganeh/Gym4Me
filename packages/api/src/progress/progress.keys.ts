import type {
  ListAthleteDataGrantsQuery,
  ListExercisesQuery,
  ListHealthSyncStatesQuery,
  ListMetricGoalsQuery,
  ListMetricRemindersQuery,
  ListMetricTypesQuery,
  ListPersonalRecordsQuery,
  ListProgressMetricsQuery,
  ListProgressPhotosQuery,
  ListWorkoutLogsQuery,
  ListWorkoutPlansQuery,
  ListWorkoutProgramsQuery,
  MetricsSummaryQuery,
} from "./progress.dto";

export const accountProgressKeys = {
  all: ["account", "progress"] as const,
  exercises: (query: ListExercisesQuery = {}) =>
    [...accountProgressKeys.all, "exercises", query] as const,
  metricTypes: (query: ListMetricTypesQuery = {}) =>
    [...accountProgressKeys.all, "metric-types", query] as const,
  workoutPrograms: (query: ListWorkoutProgramsQuery = {}) =>
    [...accountProgressKeys.all, "workout-programs", query] as const,
  workoutProgram: (id: string) =>
    [...accountProgressKeys.all, "workout-program", id] as const,
  workoutPlans: (query: ListWorkoutPlansQuery = {}) =>
    [...accountProgressKeys.all, "workout-plans", query] as const,
  workoutPlan: (id: string) =>
    [...accountProgressKeys.all, "workout-plan", id] as const,
  metrics: (query: ListProgressMetricsQuery = {}) =>
    [...accountProgressKeys.all, "metrics", query] as const,
  metricsSummary: (query: MetricsSummaryQuery = {}) =>
    [...accountProgressKeys.all, "metrics-summary", query] as const,
  photos: (query: ListProgressPhotosQuery = {}) =>
    [...accountProgressKeys.all, "photos", query] as const,
  workoutLogs: (query: ListWorkoutLogsQuery = {}) =>
    [...accountProgressKeys.all, "workout-logs", query] as const,
  personalRecords: (query: ListPersonalRecordsQuery = {}) =>
    [...accountProgressKeys.all, "personal-records", query] as const,
  goals: (query: ListMetricGoalsQuery = {}) =>
    [...accountProgressKeys.all, "goals", query] as const,
  reminders: (query: ListMetricRemindersQuery = {}) =>
    [...accountProgressKeys.all, "reminders", query] as const,
  healthSync: (query: ListHealthSyncStatesQuery = {}) =>
    [...accountProgressKeys.all, "health-sync", query] as const,
  consentHistory: () =>
    [...accountProgressKeys.all, "consent-history"] as const,
  dataGrants: (query: ListAthleteDataGrantsQuery = {}) =>
    [...accountProgressKeys.all, "data-grants", query] as const,
};
