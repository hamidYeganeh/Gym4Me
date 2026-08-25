import type { OfflineCheckinReconciliation } from "@repo/api/checkin";

export type OwnerCheckInDeskScreenProps = {
  pending?: boolean;
  message?: string | null;
  error?: string | null;
  onSubmit: (code: string) => Promise<void> | void;
  reconciliations?: OfflineCheckinReconciliation[];
  reconciliationsLoading?: boolean;
  resolutionPendingId?: string | null;
  onResolve?: (
    reconciliation: OfflineCheckinReconciliation,
    action: "retry" | "dismiss",
    reason: string,
  ) => Promise<void> | void;
  className?: string;
};
