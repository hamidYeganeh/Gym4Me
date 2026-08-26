/** Owner retention lifecycle (`/account/clubs/:clubId/lifecycle`). */
export const accountLifecycleEndpoints = {
  segments: (clubId: string) => `/account/clubs/${clubId}/lifecycle/segments`,
  atRisk: (clubId: string) => `/account/clubs/${clubId}/lifecycle/at-risk`,
  journeys: (clubId: string) => `/account/clubs/${clubId}/lifecycle/journeys`,
  enrollExpiring: (clubId: string) =>
    `/account/clubs/${clubId}/lifecycle/journeys/enroll-expiring`,
  runJourneys: (clubId: string) =>
    `/account/clubs/${clubId}/lifecycle/journeys/run`,
  broadcasts: (clubId: string, page = 1, pageSize = 20) =>
    `/account/clubs/${clubId}/lifecycle/broadcasts?page=${page}&pageSize=${pageSize}`,
  createBroadcast: (clubId: string) =>
    `/account/clubs/${clubId}/lifecycle/broadcasts`,
} as const;
