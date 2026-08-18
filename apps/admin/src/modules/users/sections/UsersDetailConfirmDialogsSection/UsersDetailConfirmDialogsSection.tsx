import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { UsersDetailConfirmDialogsSectionProps } from "./UsersDetailConfirmDialogsSection.types";

export function UsersDetailConfirmDialogsSection({
  activateOpen,
  deactivateOpen,
  deleteOpen,
  actionPending,
  reason,
  onActivateOpenChange,
  onDeactivateOpenChange,
  onDeleteOpenChange,
  onActivateConfirm,
  onDeactivateConfirm,
  onDeleteConfirm,
  onReasonChange,
}: UsersDetailConfirmDialogsSectionProps) {
  const t = useTranslations("Admin.Users");

  return (
    <>
      <AdminConfirmDialog
        body={<Typography>{t("detail.activateBody")}</Typography>}
        cancelLabel={t("detail.activateCancel")}
        confirmLabel={t("detail.activateConfirm")}
        confirmVariant="primary"
        isOpen={activateOpen}
        isPending={actionPending}
        title={t("detail.activateTitle")}
        onConfirm={onActivateConfirm}
        onOpenChange={onActivateOpenChange}
      />

      <AdminConfirmDialog
        body={
          <>
            <Typography>{t("detail.deactivateBody")}</Typography>
            <TextField name="reason" value={reason} onChange={onReasonChange}>
              <Label>{t("detail.reason")}</Label>
              <Input />
            </TextField>
          </>
        }
        cancelLabel={t("detail.deactivateCancel")}
        confirmLabel={t("detail.deactivateConfirm")}
        isOpen={deactivateOpen}
        isPending={actionPending}
        title={t("detail.deactivateTitle")}
        onConfirm={onDeactivateConfirm}
        onOpenChange={onDeactivateOpenChange}
      />

      <AdminConfirmDialog
        body={<Typography>{t("detail.deleteBody")}</Typography>}
        cancelLabel={t("detail.deleteCancel")}
        confirmLabel={t("detail.deleteConfirm")}
        isOpen={deleteOpen}
        isPending={actionPending}
        title={t("detail.deleteTitle")}
        onConfirm={onDeleteConfirm}
        onOpenChange={onDeleteOpenChange}
      />
    </>
  );
}
