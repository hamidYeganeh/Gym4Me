import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { FoodItemsArchiveDialogSectionProps } from "./FoodItemsArchiveDialogSection.types";

export function FoodItemsArchiveDialogSection({
  archiving,
  archivePending,
  archiveError,
  onConfirm,
  onOpenChange,
}: FoodItemsArchiveDialogSectionProps) {
  const t = useTranslations("Admin.Catalog");

  return (
    <AdminConfirmDialog
      body={
        <>
          <p>{t("food.archiveBody")}</p>
          {archiveError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {archiveError}
            </p>
          ) : null}
        </>
      }
      cancelLabel={t("cancel")}
      confirmLabel={t("archive")}
      confirmVariant="danger"
      isOpen={Boolean(archiving)}
      isPending={archivePending}
      title={t("food.archiveTitle")}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}
