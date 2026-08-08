/** Admin KYC review (`/admin/kyc`). */
export const adminKycEndpoints = {
  requests: "/admin/kyc/requests",
  requestById: (id: string) => `/admin/kyc/requests/${id}`,
  document: (id: string) => `/admin/kyc/requests/${id}/document`,
} as const;
