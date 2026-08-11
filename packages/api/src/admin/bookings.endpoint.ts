/** Platform booking ops (`/admin/bookings`). */
export const adminBookingsEndpoints = {
  root: "/admin/bookings",
  byId: (id: string) => `/admin/bookings/${id}`,
  cancel: (id: string) => `/admin/bookings/${id}/cancel`,
  refund: (id: string) => `/admin/bookings/${id}/refund`,
} as const;
