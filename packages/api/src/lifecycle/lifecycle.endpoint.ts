/** Owner retention lifecycle (`/account/clubs/:clubId/lifecycle`). */
export const accountLifecycleEndpoints = {
  segments: (clubId: string) => `/account/clubs/${clubId}/lifecycle/segments`,
  atRisk: (clubId: string) => `/account/clubs/${clubId}/lifecycle/at-risk`,
  journeys: (clubId: string) => `/account/clubs/${clubId}/lifecycle/journeys`,
  enrollExpiring: (clubId: string) =>
    `/account/clubs/${clubId}/lifecycle/journeys/enroll-expiring`,
  runJourneys: (clubId: string) =>
    `/account/clubs/${clubId}/lifecycle/journeys/run`,
} as const;
