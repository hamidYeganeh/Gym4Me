export const accountProgressEndpoints = {
  metricTypes: "/account/progress/metric-types",
  workoutPrograms: "/account/progress/workout-programs",
  workoutProgram: (id: string) => `/account/progress/workout-programs/${id}`,
  assignWorkoutProgram: (id: string) =>
    `/account/progress/workout-programs/${id}/assign`,
  metrics: "/account/progress/metrics",
} as const;
