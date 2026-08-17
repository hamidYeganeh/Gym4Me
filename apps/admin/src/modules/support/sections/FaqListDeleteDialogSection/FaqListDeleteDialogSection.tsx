import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { FaqListDeleteDialogSectionProps } from "./FaqListDeleteDialogSection.types";

export function FaqListDeleteDialogSection({
  deleting,
  deletePending,
  deleteError,
  onConfirm,
  onOpenChange,
}: FaqListDeleteDialogSectionProps) {
  const t = useTranslations("Admin.Support");

  return (
    <AdminConfirmDialog
      body={
        <>
          <p>{t("faqActions.deleteBody")}</p>
          {deleteError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {deleteError}
            </p>
          ) : null}
        </>
      }
      cancelLabel={t("cancel")}
      confirmLabel={t("faqActions.delete")}
      confirmVariant="danger"
      isOpen={Boolean(deleting)}
      isPending={deletePending}
      title={t("faqActions.deleteTitle")}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}
