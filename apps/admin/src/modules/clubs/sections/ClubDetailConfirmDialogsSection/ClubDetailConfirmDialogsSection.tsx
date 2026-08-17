import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { ClubDetailConfirmDialogsSectionProps } from "./ClubDetailConfirmDialogsSection.types";

export function ClubDetailConfirmDialogsSection({
  activateOpen,
  deactivateOpen,
  deleteOpen,
  pending,
  onActivateOpenChange,
  onDeactivateOpenChange,
  onDeleteOpenChange,
  onActivateConfirm,
  onDeactivateConfirm,
  onDeleteConfirm,
}: ClubDetailConfirmDialogsSectionProps) {
  const t = useTranslations("Admin.Clubs");

  return (
    <>
      <AdminConfirmDialog
        body={<Typography>{t("detail.activateBody")}</Typography>}
        cancelLabel={t("detail.cancel")}
        confirmLabel={t("detail.activateConfirm")}
        confirmVariant="primary"
        isOpen={activateOpen}
        isPending={pending}
        title={t("detail.activateTitle")}
        onConfirm={onActivateConfirm}
        onOpenChange={onActivateOpenChange}
      />

      <AdminConfirmDialog
        body={<Typography>{t("detail.deactivateBody")}</Typography>}
        cancelLabel={t("detail.cancel")}
        confirmLabel={t("detail.deactivateConfirm")}
        isOpen={deactivateOpen}
        isPending={pending}
        title={t("detail.deactivateTitle")}
        onConfirm={onDeactivateConfirm}
        onOpenChange={onDeactivateOpenChange}
      />

      <AdminConfirmDialog
        body={<Typography>{t("detail.deleteBody")}</Typography>}
        cancelLabel={t("detail.cancel")}
        confirmLabel={t("detail.deleteConfirm")}
        isOpen={deleteOpen}
        isPending={pending}
        title={t("detail.deleteTitle")}
        onConfirm={onDeleteConfirm}
        onOpenChange={onDeleteOpenChange}
      />
    </>
  );
}
