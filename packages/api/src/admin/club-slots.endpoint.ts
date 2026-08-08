/** Admin club slots & classes (`/admin/clubs/:id/...`). */
export const adminClubSlotsEndpoints = {
  classes: (clubId: string) => `/admin/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/admin/clubs/${clubId}/classes/${classId}`,
  slots: (clubId: string) => `/admin/clubs/${clubId}/slots`,
  slotById: (clubId: string, slotId: string) =>
    `/admin/clubs/${clubId}/slots/${slotId}`,
  cancelOccurrence: (clubId: string, slotId: string) =>
    `/admin/clubs/${clubId}/slots/${slotId}/cancel-occurrence`,
} as const;
