export const accountCoachingEndpoints = {
  students: "/account/coaching/students",
  student: (id: string) => `/account/coaching/students/${id}`,
  analyticsOverview: "/account/coaching/analytics/overview",
} as const;
