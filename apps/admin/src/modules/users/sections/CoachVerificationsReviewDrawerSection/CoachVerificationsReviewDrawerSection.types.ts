import type { CoachVerificationItem } from "@repo/api";

export type CoachVerificationsReviewDrawerSectionProps = {
  selected: CoachVerificationItem | null;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
};
