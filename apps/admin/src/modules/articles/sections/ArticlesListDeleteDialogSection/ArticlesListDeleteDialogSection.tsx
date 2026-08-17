import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { ArticlesListDeleteDialogSectionProps } from "./ArticlesListDeleteDialogSection.types";

export function ArticlesListDeleteDialogSection({
  deleting,
  deletePending,
  deleteError,
  onConfirm,
  onOpenChange,
}: ArticlesListDeleteDialogSectionProps) {
  const t = useTranslations("Admin.Articles");

  return (
    <AdminConfirmDialog
      body={
        <>
          <p>{t("actions.deleteBody")}</p>
          {deleteError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {deleteError}
            </p>
          ) : null}
        </>
      }
      cancelLabel={t("cancel")}
      confirmLabel={t("actions.delete")}
      confirmVariant="danger"
      isOpen={Boolean(deleting)}
      isPending={deletePending}
      title={t("actions.deleteTitle")}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}
