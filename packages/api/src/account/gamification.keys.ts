import type { ListMyPointTransactionsQuery } from "./gamification.dto";

export const accountGamificationKeys = {
  all: ["account", "gamification"] as const,
  summary: () => [...accountGamificationKeys.all, "summary"] as const,
  achievements: () => [...accountGamificationKeys.all, "achievements"] as const,
  transactions: (query: ListMyPointTransactionsQuery = {}) =>
    [...accountGamificationKeys.all, "transactions", query] as const,
};
