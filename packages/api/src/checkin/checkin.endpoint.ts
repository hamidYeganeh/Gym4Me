/** Check-in — athlete history + club desk. */
export const accountCheckinEndpoints = {
  mine: "/account/checkin",
  club: (clubId: string) => `/account/clubs/${clubId}/checkin`,
  clubBooking: (clubId: string) => `/account/clubs/${clubId}/checkin/booking`,
  clubMembership: (clubId: string) =>
    `/account/clubs/${clubId}/checkin/membership`,
  clubSync: (clubId: string) => `/account/clubs/${clubId}/checkin/sync`,
  offlineSnapshots: (clubId: string) =>
    `/account/clubs/${clubId}/checkin/offline-snapshots`,
  offlineReconciliations: (clubId: string) =>
    `/account/clubs/${clubId}/checkin/offline-reconciliations`,
  resolveOfflineReconciliation: (clubId: string, reconciliationId: string) =>
    `/account/clubs/${clubId}/checkin/offline-reconciliations/${reconciliationId}/resolve`,
  devices: (clubId: string) => `/account/clubs/${clubId}/checkin-devices`,
  rotateDevice: (clubId: string, deviceId: string) =>
    `/account/clubs/${clubId}/checkin-devices/${deviceId}/rotate-secret`,
  revokeDevice: (clubId: string, deviceId: string) =>
    `/account/clubs/${clubId}/checkin-devices/${deviceId}/revoke`,
} as const;
