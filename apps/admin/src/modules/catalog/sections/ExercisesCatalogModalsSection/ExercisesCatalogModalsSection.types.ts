import type { Exercise } from "@repo/api";

export type ExercisesCatalogModalsSectionProps = {
  rejecting: Exercise | null;
  onRejectingOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  archiving: Exercise | null;
  onArchivingOpenChange: (open: boolean) => void;
  actionPending: boolean;
  actionError: string | null;
  onRejectConfirm: () => void;
  onArchiveConfirm: () => void;
};
