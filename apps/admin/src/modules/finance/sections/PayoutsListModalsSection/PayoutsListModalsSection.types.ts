import type { Payout } from "@repo/api";

export type PayoutsListModalsSectionProps = {
  draftOpen: boolean;
  onDraftOpenChange: (open: boolean) => void;
  draftClubId: string;
  onDraftClubIdChange: (value: string) => void;
  draftFrom: string;
  onDraftFromChange: (value: string) => void;
  draftTo: string;
  onDraftToChange: (value: string) => void;
  onDraftConfirm: () => void;
  disputing: Payout | null;
  onDisputingOpenChange: (open: boolean) => void;
  disputeReason: string;
  onDisputeReasonChange: (value: string) => void;
  onDisputeConfirm: () => void;
  resolving: Payout | null;
  onResolvingOpenChange: (open: boolean) => void;
  resolveNote: string;
  onResolveNoteChange: (value: string) => void;
  onResolveAccept: () => void;
  onResolveReject: () => void;
  settling: Payout | null;
  onSettlingOpenChange: (open: boolean) => void;
  onSettleConfirm: () => void;
  actionPending: boolean;
  actionError: string | null;
};
