import type {
  GamificationSubjectType,
  PointTransactionReason,
  PointsSummary,
} from "../account/gamification.dto";

export type EntityStatus = "active" | "inactive" | "archived";

export type AchievementGrantMode = "automatic" | "manual";

export type AchievementMetric =
  | "lifetime_points"
  | "bookings_count"
  | "articles_read_count"
  | "articles_liked_count"
  | "reviews_count"
  | "reviews_average"
  | "branches_count";

export type PointRuleEvent =
  | "booking_completed"
  | "article_read"
  | "article_liked"
  | "article_commented"
  | "club_review_approved"
  | "referral_joined"
  | "profile_completed";

export type PointRuleRepeat = "unlimited" | "once_per_target" | "once";

export interface AdminAchievement {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  badgeMediaId: string | null;
  audience: GamificationSubjectType[];
  bonusPoints: number;
  grant: {
    mode: AchievementGrantMode;
    rule: { metric: AchievementMetric; threshold: number } | null;
  };
  status: EntityStatus;
  order: number;
  createdAt: string | null;
  updatedAt: string | null;
  /** Present in list responses. */
  grantsCount?: number;
}

export interface CreateAchievementInput {
  title: string;
  description?: string;
  icon?: string;
  badgeMediaId?: string;
  audience: GamificationSubjectType[];
  bonusPoints?: number;
  grant: {
    mode: AchievementGrantMode;
    rule?: { metric: AchievementMetric; threshold: number };
  };
  status?: EntityStatus;
  order?: number;
}

export type UpdateAchievementInput = Partial<CreateAchievementInput>;

export type ListAdminAchievementsQuery = {
  page?: number;
  page_size?: number;
  status?: EntityStatus;
  audience?: GamificationSubjectType;
};

export interface AdminPointRule {
  id: string;
  title: string;
  description: string | null;
  event: PointRuleEvent;
  awards: { subjectType: GamificationSubjectType; points: number }[];
  limits: { repeat: PointRuleRepeat; dailyCap: number | null };
  effective: { from: string | null; to: string | null };
  status: EntityStatus;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreatePointRuleInput {
  title: string;
  description?: string;
  event: PointRuleEvent;
  awards: { subjectType: GamificationSubjectType; points: number }[];
  limits?: { repeat?: PointRuleRepeat; dailyCap?: number };
  effective?: { from?: string; to?: string };
  status?: EntityStatus;
}

export type UpdatePointRuleInput = Partial<CreatePointRuleInput>;

export type ListAdminPointRulesQuery = {
  page?: number;
  page_size?: number;
  status?: EntityStatus;
  event?: PointRuleEvent;
};

export interface GrantAchievementSubjectInput {
  subjectType: GamificationSubjectType;
  /** userId for athlete/coach, clubId for club. */
  subjectId: string;
}

export interface AdjustPointsInput extends GrantAchievementSubjectInput {
  /** Positive credits, negative debits. */
  amount: number;
  note: string;
}

export type ListAdminPointTransactionsQuery = {
  page?: number;
  page_size?: number;
  subjectType?: GamificationSubjectType;
  subjectId?: string;
  reason?: PointTransactionReason;
  ruleId?: string;
};

export type ListAdminGrantsQuery = {
  page?: number;
  page_size?: number;
  subjectType?: GamificationSubjectType;
  subjectId?: string;
  achievementId?: string;
};

export interface AdminAchievementGrant {
  id: string;
  achievementId: string;
  subject: { type: GamificationSubjectType; id: string };
  grantedAt: string;
  grantedBy: string;
}

export interface GamificationOverview {
  totals: {
    earned: number;
    spent: number;
    transactions: number;
    grants: number;
  };
  byReason: { reason: PointTransactionReason; total: number; count: number }[];
  byRule: {
    ruleId: string;
    title: string | null;
    event: PointRuleEvent | null;
    total: number;
    count: number;
  }[];
  topSubjects: {
    subjectType: GamificationSubjectType;
    subjectId: string;
    total: number;
  }[];
}

export interface AdjustPointsResult {
  points: PointsSummary;
}
