import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { BannersListDeleteDialogSectionProps } from "./BannersListDeleteDialogSection.types";

export function BannersListDeleteDialogSection({
  deleting,
  deletePending,
  deleteError,
  onConfirm,
  onOpenChange,
}: BannersListDeleteDialogSectionProps) {
  const t = useTranslations("Admin.Banners");

  return (
    <AdminConfirmDialog
      body={
        <>
          <Typography>{t("actions.deleteBody")}</Typography>
          {deleteError ? (
            <Typography className="mt-2 text-sm text-danger" role="alert">
              {deleteError}
            </Typography>
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
