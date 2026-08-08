/** Public discovery clubs (`/discovery/clubs`). */
export const discoveryClubsEndpoints = {
  root: "/discovery/clubs",
  byId: (clubId: string) => `/discovery/clubs/${clubId}`,
  reviews: (clubId: string) => `/discovery/clubs/${clubId}/reviews`,
  branches: (clubId: string) => `/discovery/clubs/${clubId}/branches`,
  classes: (clubId: string) => `/discovery/clubs/${clubId}/classes`,
  coaches: (clubId: string) => `/discovery/clubs/${clubId}/coaches`,
} as const;
