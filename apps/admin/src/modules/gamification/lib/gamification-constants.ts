import type {
  AchievementGrantMode,
  AchievementMetric,
  GamificationSubjectType,
  PointRuleEvent,
  PointRuleRepeat,
} from "@repo/api";

export const SUBJECT_TYPES: GamificationSubjectType[] = [
  "athlete",
  "coach",
  "club",
];

export const GRANT_MODES: AchievementGrantMode[] = ["automatic", "manual"];

export const ACHIEVEMENT_METRICS: AchievementMetric[] = [
  "lifetime_points",
  "bookings_count",
  "articles_read_count",
  "articles_liked_count",
  "reviews_count",
  "reviews_average",
  "branches_count",
];

export const POINT_RULE_EVENTS: PointRuleEvent[] = [
  "booking_completed",
  "article_read",
  "article_liked",
  "article_commented",
  "club_review_approved",
  "referral_joined",
  "profile_completed",
];

export const POINT_RULE_REPEATS: PointRuleRepeat[] = [
  "unlimited",
  "once_per_target",
  "once",
];

export const ENTITY_STATUSES = ["active", "inactive", "archived"] as const;
