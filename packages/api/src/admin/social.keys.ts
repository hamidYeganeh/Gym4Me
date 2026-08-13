import type { ListAdminSocialReportsQuery } from "./social.dto";

export const adminSocialKeys = {
  all: ["admin", "social"] as const,
  reports: (query: ListAdminSocialReportsQuery = {}) =>
    [...adminSocialKeys.all, "reports", query] as const,
};
