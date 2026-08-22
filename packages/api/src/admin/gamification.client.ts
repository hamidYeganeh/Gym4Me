import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type { PointTransactionItem } from "../account/gamification.dto";
import type { SeedDefaultsResult } from "./basics.dto";
import type {
  AdjustPointsInput,
  AdjustPointsResult,
  AdminAchievement,
  AdminAchievementGrant,
  AdminPointRule,
  CreateAchievementInput,
  CreatePointRuleInput,
  GamificationOverview,
  GrantAchievementSubjectInput,
  ListAdminAchievementsQuery,
  ListAdminGrantsQuery,
  ListAdminPointRulesQuery,
  ListAdminPointTransactionsQuery,
  UpdateAchievementInput,
  UpdatePointRuleInput,
} from "./gamification.dto";
import { adminGamificationEndpoints as ep } from "./gamification.endpoint";

/** Admin CRUD for achievements + point rules, ledger and analytics. */
export function createAdminGamificationApi(client: ApiClient) {
  return {
    // Achievements
    listAchievements(query: ListAdminAchievementsQuery = {}) {
      return client.request<Paginated<AdminAchievement>>(ep.achievements, {
        query,
      });
    },
    getAchievement(id: string) {
      return client.request<AdminAchievement>(ep.achievement(id));
    },
    createAchievement(input: CreateAchievementInput) {
      return client.request<AdminAchievement>(ep.achievements, {
        method: "POST",
        body: input,
      });
    },
    seedAchievementDefaults() {
      return client.request<SeedDefaultsResult>(ep.seedAchievementDefaults, {
        method: "POST",
      });
    },
    updateAchievement(id: string, input: UpdateAchievementInput) {
      return client.request<AdminAchievement>(ep.achievement(id), {
        method: "PATCH",
        body: input,
      });
    },
    archiveAchievement(id: string) {
      return client.request<{ archived: boolean }>(ep.achievement(id), {
        method: "DELETE",
      });
    },
    grantAchievement(id: string, input: GrantAchievementSubjectInput) {
      return client.request<{ granted: boolean }>(ep.achievementGrants(id), {
        method: "POST",
        body: input,
      });
    },
    revokeAchievement(id: string, input: GrantAchievementSubjectInput) {
      return client.request<{ revoked: boolean }>(ep.achievementGrants(id), {
        method: "DELETE",
        body: input,
      });
    },
    listGrants(query: ListAdminGrantsQuery = {}) {
      return client.request<Paginated<AdminAchievementGrant>>(ep.grants, {
        query,
      });
    },

    // Point rules
    listPointRules(query: ListAdminPointRulesQuery = {}) {
      return client.request<Paginated<AdminPointRule>>(ep.pointRules, {
        query,
      });
    },
    getPointRule(id: string) {
      return client.request<AdminPointRule>(ep.pointRule(id));
    },
    createPointRule(input: CreatePointRuleInput) {
      return client.request<AdminPointRule>(ep.pointRules, {
        method: "POST",
        body: input,
      });
    },
    updatePointRule(id: string, input: UpdatePointRuleInput) {
      return client.request<AdminPointRule>(ep.pointRule(id), {
        method: "PATCH",
        body: input,
      });
    },
    archivePointRule(id: string) {
      return client.request<{ archived: boolean }>(ep.pointRule(id), {
        method: "DELETE",
      });
    },

    // Ledger + analytics
    listTransactions(query: ListAdminPointTransactionsQuery = {}) {
      return client.request<Paginated<PointTransactionItem>>(ep.transactions, {
        query,
      });
    },
    adjustPoints(input: AdjustPointsInput) {
      return client.request<AdjustPointsResult>(ep.adjustments, {
        method: "POST",
        body: input,
      });
    },
    overview() {
      return client.request<GamificationOverview>(ep.overview);
    },
  };
}

export type AdminGamificationApi = ReturnType<typeof createAdminGamificationApi>;
