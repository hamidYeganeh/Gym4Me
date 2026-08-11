import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  GamificationSummary,
  ListMyPointTransactionsQuery,
  MyAchievement,
  PointTransactionItem,
} from "./gamification.dto";
import { accountGamificationEndpoints as ep } from "./gamification.endpoint";

/** Points balance, badge grid and points history for the active role. */
export function createAccountGamificationApi(client: ApiClient) {
  return {
    summary() {
      return client.request<GamificationSummary>(ep.summary);
    },

    achievements() {
      return client.request<MyAchievement[]>(ep.achievements);
    },

    transactions(query: ListMyPointTransactionsQuery = {}) {
      return client.request<Paginated<PointTransactionItem>>(ep.transactions, {
        query,
      });
    },
  };
}

export type AccountGamificationApi = ReturnType<
  typeof createAccountGamificationApi
>;
