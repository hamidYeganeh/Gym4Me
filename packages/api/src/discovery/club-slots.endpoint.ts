/** Public discovery club calendar, classes & slots. */
export const discoveryClubSlotsEndpoints = {
  calendar: (clubId: string) => `/discovery/clubs/${clubId}/calendar`,
  classes: (clubId: string) => `/discovery/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/discovery/clubs/${clubId}/classes/${classId}`,
  slots: (clubId: string) => `/discovery/clubs/${clubId}/slots`,
  slotById: (clubId: string, slotId: string) =>
    `/discovery/clubs/${clubId}/slots/${slotId}`,
} as const;
