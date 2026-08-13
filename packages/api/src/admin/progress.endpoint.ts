/** Exercise library + metric-type catalogs (`/admin/progress`). */
export const adminProgressEndpoints = {
  exercises: "/admin/progress/exercises",
  exercise: (id: string) => `/admin/progress/exercises/${id}`,
  verifyExercise: (id: string) => `/admin/progress/exercises/${id}/verify`,
  metricTypes: "/admin/progress/metric-types",
  metricType: (id: string) => `/admin/progress/metric-types/${id}`,
} as const;
