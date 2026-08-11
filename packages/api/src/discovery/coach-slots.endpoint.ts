/** Public coach availability (`/discovery/coaches/:userId/slots`). */
export const discoveryCoachSlotsEndpoints = {
  byUserId: (userId: string) => `/discovery/coaches/${userId}/slots`,
} as const;
