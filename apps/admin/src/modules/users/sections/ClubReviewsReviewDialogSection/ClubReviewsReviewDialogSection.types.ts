import type { Club } from "@repo/api";

export type ClubReviewsReviewDialogSectionProps = {
  review: { club: Club; action: "approve" | "reject" } | null;
  reviewNote: string;
  onReviewNoteChange: (value: string) => void;
  pending: boolean;
  reviewError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
