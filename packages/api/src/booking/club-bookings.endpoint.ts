/** Club-owner venue bookings (`/club_owner/clubs/:clubId/bookings`). */
export const clubBookingsEndpoints = {
  root: (clubId: string) => `/club_owner/clubs/${clubId}/bookings`,
  byId: (clubId: string, id: string) =>
    `/club_owner/clubs/${clubId}/bookings/${id}`,
  checkIn: (clubId: string, id: string) =>
    `/club_owner/clubs/${clubId}/bookings/${id}/checkin`,
  complete: (clubId: string, id: string) =>
    `/club_owner/clubs/${clubId}/bookings/${id}/complete`,
  noShow: (clubId: string, id: string) =>
    `/club_owner/clubs/${clubId}/bookings/${id}/no-show`,
  cancel: (clubId: string, id: string) =>
    `/club_owner/clubs/${clubId}/bookings/${id}/cancel`,
} as const;
