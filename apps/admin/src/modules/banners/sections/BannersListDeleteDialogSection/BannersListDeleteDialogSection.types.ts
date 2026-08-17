import type { AdminBanner } from "@repo/api";

export type BannersListDeleteDialogSectionProps = {
  deleting: AdminBanner | null;
  deletePending: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
