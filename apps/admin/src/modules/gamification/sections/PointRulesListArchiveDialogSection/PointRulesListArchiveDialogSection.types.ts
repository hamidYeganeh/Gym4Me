import type { AdminPointRule } from "@repo/api";

export type PointRulesListArchiveDialogSectionProps = {
  archiving: AdminPointRule | null;
  archivePending: boolean;
  archiveError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
