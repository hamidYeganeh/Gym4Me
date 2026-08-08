/** Public discovery club calendar & classes. */
export const discoveryClubSlotsEndpoints = {
  calendar: (clubId: string) => `/discovery/clubs/${clubId}/calendar`,
  classes: (clubId: string) => `/discovery/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/discovery/clubs/${clubId}/classes/${classId}`,
} as const;
