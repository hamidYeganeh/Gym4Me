/** Athlete bookings (`/account/bookings`). */
export const accountBookingsEndpoints = {
  root: "/account/bookings",
  club: "/account/bookings/club",
  seriesCancel: (groupId: string) =>
    `/account/bookings/series/${groupId}/cancel`,
  byId: (id: string) => `/account/bookings/${id}`,
  cancellationPreview: (id: string) =>
    `/account/bookings/${id}/cancellation-preview`,
  pay: (id: string) => `/account/bookings/${id}/pay`,
  payVerify: (id: string) => `/account/bookings/${id}/pay/verify`,
  reschedule: (id: string) => `/account/bookings/${id}/reschedule`,
  cancel: (id: string) => `/account/bookings/${id}/cancel`,
} as const;
