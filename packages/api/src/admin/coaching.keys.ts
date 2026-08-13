import type { AdminListCoachingQuery } from "./coaching.dto";

export const adminCoachingKeys = {
  all: ["admin", "coaching"] as const,
  services: (query: AdminListCoachingQuery = {}) =>
    [...adminCoachingKeys.all, "services", query] as const,
  packages: (query: AdminListCoachingQuery = {}) =>
    [...adminCoachingKeys.all, "packages", query] as const,
  students: (query: AdminListCoachingQuery = {}) =>
    [...adminCoachingKeys.all, "students", query] as const,
  healthAssessment: (athleteUserId: string) =>
    [...adminCoachingKeys.all, "health-assessment", athleteUserId] as const,
};
