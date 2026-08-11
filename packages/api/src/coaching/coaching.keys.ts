import type { AnalyticsPeriod } from "../finance/finance.dto";
import type { ListStudentsQuery } from "./coaching.dto";

export const accountCoachingKeys = {
  all: ["account", "coaching"] as const,
  students: (query: ListStudentsQuery = {}) =>
    [...accountCoachingKeys.all, "students", query] as const,
  analytics: (period?: AnalyticsPeriod) =>
    [...accountCoachingKeys.all, "analytics", period] as const,
};
