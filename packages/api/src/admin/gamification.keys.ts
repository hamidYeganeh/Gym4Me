import type {
  ListAdminAchievementsQuery,
  ListAdminGrantsQuery,
  ListAdminPointRulesQuery,
  ListAdminPointTransactionsQuery,
} from "./gamification.dto";

export const adminGamificationKeys = {
  all: ["admin", "gamification"] as const,
  achievements: (query: ListAdminAchievementsQuery = {}) =>
    [...adminGamificationKeys.all, "achievements", query] as const,
  achievement: (id: string) =>
    [...adminGamificationKeys.all, "achievements", "detail", id] as const,
  grants: (query: ListAdminGrantsQuery = {}) =>
    [...adminGamificationKeys.all, "grants", query] as const,
  pointRules: (query: ListAdminPointRulesQuery = {}) =>
    [...adminGamificationKeys.all, "point-rules", query] as const,
  pointRule: (id: string) =>
    [...adminGamificationKeys.all, "point-rules", "detail", id] as const,
  transactions: (query: ListAdminPointTransactionsQuery = {}) =>
    [...adminGamificationKeys.all, "transactions", query] as const,
  overview: () => [...adminGamificationKeys.all, "overview"] as const,
};
