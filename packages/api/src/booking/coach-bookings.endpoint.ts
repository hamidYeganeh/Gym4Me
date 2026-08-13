/** Coach-side bookings (`/coach/bookings`). */
export const coachBookingsEndpoints = {
  root: "/coach/bookings",
  byId: (id: string) => `/coach/bookings/${id}`,
  cancellationPreview: (id: string) =>
    `/coach/bookings/${id}/cancellation-preview`,
  accept: (id: string) => `/coach/bookings/${id}/accept`,
  cancel: (id: string) => `/coach/bookings/${id}/cancel`,
  checkIn: (id: string) => `/coach/bookings/${id}/checkin`,
  complete: (id: string) => `/coach/bookings/${id}/complete`,
  noShow: (id: string) => `/coach/bookings/${id}/no-show`,
} as const;
