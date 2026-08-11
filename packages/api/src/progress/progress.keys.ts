import type {
  ListMetricTypesQuery,
  ListWorkoutProgramsQuery,
} from "./progress.dto";

export const accountProgressKeys = {
  all: ["account", "progress"] as const,
  metricTypes: (query: ListMetricTypesQuery = {}) =>
    [...accountProgressKeys.all, "metric-types", query] as const,
  workoutPrograms: (query: ListWorkoutProgramsQuery = {}) =>
    [...accountProgressKeys.all, "workout-programs", query] as const,
  workoutProgram: (id: string) =>
    [...accountProgressKeys.all, "workout-program", id] as const,
};
