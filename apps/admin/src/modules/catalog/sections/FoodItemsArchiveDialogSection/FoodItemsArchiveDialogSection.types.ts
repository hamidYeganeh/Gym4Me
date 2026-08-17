import type { FoodItem } from "@repo/api";

export type FoodItemsArchiveDialogSectionProps = {
  archiving: FoodItem | null;
  archivePending: boolean;
  archiveError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
