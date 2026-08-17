import type { AdminKycRequest } from "@repo/api";

export type KycListReviewDrawerSectionProps = {
  selected: AdminKycRequest | null;
  onOpenChange: (open: boolean) => void;
  docPending: boolean;
  docError: string | null;
  onOpenDocument: () => void;
  onApprove: () => void;
  onReject: () => void;
};
