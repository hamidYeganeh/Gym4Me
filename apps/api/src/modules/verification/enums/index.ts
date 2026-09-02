export const VERIFICATION_SUBJECTS = ["coach_profile", "club", "organization"] as const;
export type VerificationSubject = (typeof VERIFICATION_SUBJECTS)[number];

export const CASE_STATUSES = [
  "pending",
  "verified",
  "rejected",
  "needs_correction",
  "archived",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const DOCUMENT_REVIEW_STATUSES = ["accepted", "rejected"] as const;
export type DocumentReviewStatus = (typeof DOCUMENT_REVIEW_STATUSES)[number];
