/** Club-owner slots & classes (`/club_owner/clubs/:id/...`). */
export const accountClubSlotsEndpoints = {
  classes: (clubId: string) => `/club_owner/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/club_owner/clubs/${clubId}/classes/${classId}`,
  slots: (clubId: string) => `/club_owner/clubs/${clubId}/slots`,
  slotById: (clubId: string, slotId: string) =>
    `/club_owner/clubs/${clubId}/slots/${slotId}`,
  cancelOccurrence: (clubId: string, slotId: string) =>
    `/club_owner/clubs/${clubId}/slots/${slotId}/cancel-occurrence`,
} as const;
