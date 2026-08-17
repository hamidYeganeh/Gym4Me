import type {
  GamificationSubjectType,
  PointTransactionReason,
} from "@repo/api";

export type PointsLedgerFiltersSectionProps = {
  subjectFilter: GamificationSubjectType | "all";
  reasonFilter: PointTransactionReason | "all";
  onSubjectChange: (value: GamificationSubjectType | "all") => void;
  onReasonChange: (value: PointTransactionReason | "all") => void;
  className?: string;
};

export const POINT_LEDGER_REASONS: PointTransactionReason[] = [
  "rule_award",
  "achievement_bonus",
  "admin_adjustment",
  "redemption",
  "expiry",
];
