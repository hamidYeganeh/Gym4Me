export const accountProgressEndpoints = {
  exercises: "/account/progress/exercises",
  metricTypes: "/account/progress/metric-types",
  workoutPrograms: "/account/progress/workout-programs",
  workoutProgram: (id: string) => `/account/progress/workout-programs/${id}`,
  assignWorkoutProgram: (id: string) =>
    `/account/progress/workout-programs/${id}/assign`,
  workoutPlans: "/account/progress/workout-plans",
  workoutPlan: (id: string) => `/account/progress/workout-plans/${id}`,
  metrics: "/account/progress/metrics",
  metric: (id: string) => `/account/progress/metrics/${id}`,
  photos: "/account/progress/photos",
  photo: (id: string) => `/account/progress/photos/${id}`,
  workoutLogs: "/account/progress/workout-logs",
  personalRecords: "/account/progress/personal-records",
} as const;
