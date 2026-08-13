/** Check-in — athlete history + club desk. */
export const accountCheckinEndpoints = {
  mine: "/account/checkin",
  club: (clubId: string) => `/account/clubs/${clubId}/checkin`,
  clubBooking: (clubId: string) => `/account/clubs/${clubId}/checkin/booking`,
  clubMembership: (clubId: string) =>
    `/account/clubs/${clubId}/checkin/membership`,
  clubSync: (clubId: string) => `/account/clubs/${clubId}/checkin/sync`,
  devices: (clubId: string) => `/account/clubs/${clubId}/checkin-devices`,
  rotateDevice: (clubId: string, deviceId: string) =>
    `/account/clubs/${clubId}/checkin-devices/${deviceId}/rotate-secret`,
} as const;
