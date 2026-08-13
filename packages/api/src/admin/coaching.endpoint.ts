/** Platform coaching listings (`/admin/coaching`). */
export const adminCoachingEndpoints = {
  services: "/admin/coaching/services",
  packages: "/admin/coaching/packages",
  students: "/admin/coaching/students",
  healthAssessment: (athleteUserId: string) =>
    `/admin/coaching/health-assessments/${athleteUserId}`,
} as const;
