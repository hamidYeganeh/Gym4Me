import type { AdminArticle } from "@repo/api";

export type ArticlesListDeleteDialogSectionProps = {
  deleting: AdminArticle | null;
  deletePending: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
