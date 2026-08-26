import type { AnalyticsPeriod } from "../finance/finance.dto";
import type { ListCoachLeadsQuery, ListStudentsQuery } from "./coaching.dto";

export const accountCoachingKeys = {
  all: ["account", "coaching"] as const,
  students: (query: ListStudentsQuery = {}) =>
    [...accountCoachingKeys.all, "students", query] as const,
  analytics: (period?: AnalyticsPeriod) =>
    [...accountCoachingKeys.all, "analytics", period] as const,
  leads: (query: ListCoachLeadsQuery = {}) =>
    [...accountCoachingKeys.all, "leads", query] as const,
  coachThreads: (query: Record<string, unknown> = {}) =>
    [...accountCoachingKeys.all, "coach-threads", query] as const,
  coachThreadMessages: (threadId: string, query: Record<string, unknown> = {}) =>
    [...accountCoachingKeys.all, "coach-thread", threadId, query] as const,
  myCoaches: (query: Record<string, unknown> = {}) =>
    [...accountCoachingKeys.all, "my-coaches", query] as const,
  myPackages: (query: Record<string, unknown> = {}) =>
    [...accountCoachingKeys.all, "my-packages", query] as const,
  athleteThreads: (query: Record<string, unknown> = {}) =>
    [...accountCoachingKeys.all, "athlete-threads", query] as const,
  athleteThreadMessages: (
    threadId: string,
    query: Record<string, unknown> = {},
  ) =>
    [...accountCoachingKeys.all, "athlete-thread", threadId, query] as const,
};
