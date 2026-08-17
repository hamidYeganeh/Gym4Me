import { Typography } from "@heroui/react";
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
          <Typography>{t("faqActions.deleteBody")}</Typography>
          {deleteError ? (
            <Typography className="mt-2 text-sm text-danger" role="alert">
              {deleteError}
            </Typography>
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
