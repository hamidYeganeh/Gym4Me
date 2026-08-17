import type { AdminFaqItem } from "@repo/api";

export type FaqListDeleteDialogSectionProps = {
  deleting: AdminFaqItem | null;
  deletePending: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
