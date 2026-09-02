export const REVIEW_SUBJECTS = ["club", "branch", "coach", "offering"] as const;
export type ReviewSubject = (typeof REVIEW_SUBJECTS)[number];

export const REVIEW_STATUSES = ["pending", "active", "rejected", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REPORT_REASONS = ["spam", "abuse", "privacy", "false_information", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const MODERATION_DECISIONS = ["approve", "reject", "hide", "restore"] as const;
export type ModerationDecision = (typeof MODERATION_DECISIONS)[number];
