import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import type { PointRulesListArchiveDialogSectionProps } from "./PointRulesListArchiveDialogSection.types";

export function PointRulesListArchiveDialogSection({
  archiving,
  archivePending,
  archiveError,
  onConfirm,
  onOpenChange,
}: PointRulesListArchiveDialogSectionProps) {
  const t = useTranslations("Admin.Gamification");

  return (
    <AdminConfirmDialog
      body={
        <>
          <Typography>{t("rules.actions.archiveBody")}</Typography>
          {archiveError ? (
            <Typography className="mt-2 text-sm text-danger" role="alert">
              {archiveError}
            </Typography>
          ) : null}
        </>
      }
      cancelLabel={t("cancel")}
      confirmLabel={t("actions.archive")}
      confirmVariant="danger"
      isOpen={Boolean(archiving)}
      isPending={archivePending}
      title={t("rules.actions.archiveTitle")}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}
