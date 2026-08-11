/** Entity kinds that can earn points / achievements. */
export type GamificationSubjectType = "athlete" | "coach" | "club";

export type AchievementState = "unlocked" | "locked";

export type PointTransactionReason =
  | "rule_award"
  | "achievement_bonus"
  | "admin_adjustment"
  | "redemption"
  | "expiry";

export interface PointsSummary {
  /** Earned − spent; drives redemptions. */
  balance: number;
  /** Total earned, never decreases; drives ranks/badges. */
  lifetime: number;
}

export interface GamificationSummary {
  subjectType: GamificationSubjectType | null;
  points: PointsSummary;
  achievements: { unlocked: number; total: number };
}

export interface MyAchievement {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  badgeMediaId: string | null;
  bonusPoints: number;
  state: AchievementState;
  grantedAt: string | null;
  /** Only present for locked automatic achievements. */
  progress: { current: number; threshold: number } | null;
}

export interface PointTransactionItem {
  id: string;
  subject: { type: GamificationSubjectType; id: string };
  amount: number;
  reason: PointTransactionReason;
  source: {
    ruleId: string | null;
    achievementId: string | null;
    targetType: string | null;
    targetId: string | null;
  };
  note: string | null;
  occurredAt: string;
}

/** Type alias (not interface) so it satisfies the client's Record query constraint. */
export type ListMyPointTransactionsQuery = {
  page?: number;
  page_size?: number;
};
