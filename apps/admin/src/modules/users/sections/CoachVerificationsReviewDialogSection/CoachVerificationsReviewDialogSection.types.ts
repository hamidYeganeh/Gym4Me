import type { CoachVerificationItem } from "@repo/api";

export type CoachVerificationsReviewDialogSectionProps = {
  review: { item: CoachVerificationItem; action: "approve" | "reject" } | null;
  reviewNote: string;
  onReviewNoteChange: (value: string) => void;
  pending: boolean;
  reviewError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
