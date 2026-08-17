import type { GamificationSubjectType } from "@repo/api";

export type PointsLedgerAdjustDrawerSectionProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subjectType: GamificationSubjectType;
  onSubjectTypeChange: (value: GamificationSubjectType) => void;
  subjectId: string;
  onSubjectIdChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  canAdjust: boolean;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};
