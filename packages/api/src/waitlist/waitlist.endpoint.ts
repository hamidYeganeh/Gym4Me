/** Waitlist — athlete (`/account/waitlists`) + club desk scopes. */
export const accountWaitlistEndpoints = {
  mine: "/account/waitlists/mine",
  join: "/account/waitlists/join",
  leave: (waitlistId: string) => `/account/waitlists/${waitlistId}/leave`,
  claim: (waitlistId: string) =>
    `/account/bookings/waitlist/${waitlistId}/claim`,
  expireOffers: "/account/waitlists/expire-offers",
  club: (clubId: string) => `/account/clubs/${clubId}/waitlists`,
  offer: (clubId: string, waitlistId: string) =>
    `/account/clubs/${clubId}/waitlists/${waitlistId}/offer`,
} as const;
