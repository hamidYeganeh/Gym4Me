import type {
  ListAdminExercisesQuery,
  ListAdminMetricTypesQuery,
} from "./progress.dto";

export const adminProgressKeys = {
  all: ["admin", "progress"] as const,
  exercises: (query: ListAdminExercisesQuery = {}) =>
    [...adminProgressKeys.all, "exercises", query] as const,
  exercise: (id: string) =>
    [...adminProgressKeys.all, "exercise", id] as const,
  metricTypes: (query: ListAdminMetricTypesQuery = {}) =>
    [...adminProgressKeys.all, "metric-types", query] as const,
  metricType: (id: string) =>
    [...adminProgressKeys.all, "metric-type", id] as const,
};
