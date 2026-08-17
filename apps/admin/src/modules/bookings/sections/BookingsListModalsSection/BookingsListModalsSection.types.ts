import type { Booking } from "@repo/api";

export type BookingsListModalsSectionProps = {
  cancelling: Booking | null;
  onCancellingOpenChange: (open: boolean) => void;
  cancelReason: string;
  onCancelReasonChange: (value: string) => void;
  refunding: Booking | null;
  onRefundingOpenChange: (open: boolean) => void;
  pending: boolean;
  actionError: string | null;
  onCancelConfirm: () => void;
  onRefundConfirm: () => void;
};
