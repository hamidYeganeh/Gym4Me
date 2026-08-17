export type KycListReviewDialogSectionProps = {
  isOpen: boolean;
  reviewAction: "approve" | "reject" | null;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  reviewPending: boolean;
  reviewError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
