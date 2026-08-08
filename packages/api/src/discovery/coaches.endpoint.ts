/** Public discovery coaches (`/discovery/coaches`). */
export const discoveryCoachesEndpoints = {
  root: "/discovery/coaches",
  byUserId: (userId: string) => `/discovery/coaches/${userId}`,
} as const;
