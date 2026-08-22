import type { PayoutRecipientType, PayoutStatus } from "@repo/api";

export type PayoutsListFiltersSectionProps = {
  statusFilter: PayoutStatus | "all";
  recipientTypeFilter: PayoutRecipientType | "all";
  recipientId: string;
  clubId: string;
  onStatusChange: (status: PayoutStatus | "all") => void;
  onRecipientTypeChange: (value: PayoutRecipientType | "all") => void;
  onRecipientIdChange: (value: string) => void;
  onClubIdChange: (value: string) => void;
  className?: string;
};

export const PAYOUT_RECIPIENT_TYPES: PayoutRecipientType[] = ["club", "coach"];
