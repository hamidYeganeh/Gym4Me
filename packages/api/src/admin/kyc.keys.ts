import type { ListAdminKycQuery } from "./kyc.dto";

export const adminKycKeys = {
  all: ["admin", "kyc"] as const,
  lists: () => [...adminKycKeys.all, "list"] as const,
  list: (query: ListAdminKycQuery = {}) =>
    [...adminKycKeys.lists(), query] as const,
  details: () => [...adminKycKeys.all, "detail"] as const,
  detail: (id: string) => [...adminKycKeys.details(), id] as const,
};
