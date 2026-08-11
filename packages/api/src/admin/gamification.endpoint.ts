/** Admin gamification management (`/admin/gamification`). */
export const adminGamificationEndpoints = {
  achievements: "/admin/gamification/achievements",
  achievement: (id: string) => `/admin/gamification/achievements/${id}`,
  achievementGrants: (id: string) =>
    `/admin/gamification/achievements/${id}/grants`,
  grants: "/admin/gamification/grants",
  pointRules: "/admin/gamification/point-rules",
  pointRule: (id: string) => `/admin/gamification/point-rules/${id}`,
  transactions: "/admin/gamification/transactions",
  adjustments: "/admin/gamification/adjustments",
  overview: "/admin/gamification/overview",
} as const;
