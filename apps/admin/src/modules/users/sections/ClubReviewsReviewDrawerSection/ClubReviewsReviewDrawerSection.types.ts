import type { Club } from "@repo/api";

export type ClubReviewsReviewDrawerSectionProps = {
  selected: Club | null;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
};
