import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog, AdminFormDrawer } from "@/shared/components";
import { exercisesCatalogModalsSectionVariants } from "./ExercisesCatalogModalsSection.styles";
import type { ExercisesCatalogModalsSectionProps } from "./ExercisesCatalogModalsSection.types";

export function ExercisesCatalogModalsSection({
  rejecting,
  onRejectingOpenChange,
  rejectionReason,
  onRejectionReasonChange,
  archiving,
  onArchivingOpenChange,
  actionPending,
  actionError,
  onRejectConfirm,
  onArchiveConfirm,
}: ExercisesCatalogModalsSectionProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = exercisesCatalogModalsSectionVariants();

  return (
    <>
      <AdminFormDrawer
        isOpen={Boolean(rejecting)}
        title={t("exercises.rejectTitle")}
        onOpenChange={onRejectingOpenChange}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="rejectionReason"
            value={rejectionReason}
            onChange={onRejectionReasonChange}
          >
            <Label>{t("exercises.fields.rejectionReason")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <Typography className="text-sm text-danger" role="alert">
              {actionError}
            </Typography>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={actionPending || !rejectionReason.trim()}
              variant="danger"
              onPress={onRejectConfirm}
            >
              {t("exercises.reject")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => onRejectingOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <Typography>{t("exercises.archiveBody")}</Typography>
            {actionError ? (
              <Typography className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </Typography>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={actionPending}
        title={t("exercises.archiveTitle")}
        onConfirm={onArchiveConfirm}
        onOpenChange={onArchivingOpenChange}
      />
    </>
  );
}
