/** Admin club slots & classes (`/admin/clubs/:id/...`). */
export const adminClubSlotsEndpoints = {
  classes: (clubId: string) => `/admin/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/admin/clubs/${clubId}/classes/${classId}`,
  spaces: (clubId: string) => `/admin/clubs/${clubId}/spaces`,
  spaceById: (clubId: string, spaceId: string) =>
    `/admin/clubs/${clubId}/spaces/${spaceId}`,
  slots: (clubId: string) => `/admin/clubs/${clubId}/slots`,
  slotById: (clubId: string, slotId: string) =>
    `/admin/clubs/${clubId}/slots/${slotId}`,
  cancelOccurrence: (clubId: string, slotId: string) =>
    `/admin/clubs/${clubId}/slots/${slotId}/cancel-occurrence`,
} as const;
