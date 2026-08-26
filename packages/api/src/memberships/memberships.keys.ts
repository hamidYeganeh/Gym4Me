import type {
  ListClubMembershipsQuery,
  ListMyMembershipsQuery,
} from "./memberships.dto";

export const accountMembershipsKeys = {
  all: ["account", "memberships"] as const,
  mine: () => [...accountMembershipsKeys.all, "mine"] as const,
  mineList: (query: ListMyMembershipsQuery = {}) =>
    [...accountMembershipsKeys.mine(), "list", query] as const,
  mineDetail: (id: string) =>
    [...accountMembershipsKeys.mine(), "detail", id] as const,
  club: (clubId: string) =>
    [...accountMembershipsKeys.all, "club", clubId] as const,
  clubList: (clubId: string, query: ListClubMembershipsQuery = {}) =>
    [...accountMembershipsKeys.club(clubId), "list", query] as const,
  clubPlans: (clubId: string) =>
    [...accountMembershipsKeys.club(clubId), "plans"] as const,
  platformPlans: () =>
    [...accountMembershipsKeys.all, "platform-plans"] as const,
  platformSubscriptions: () =>
    [...accountMembershipsKeys.all, "platform-subscriptions"] as const,
  platformEntitlements: (clubId?: string) =>
    [...accountMembershipsKeys.all, "platform-entitlements", clubId ?? "global"] as const,
};
