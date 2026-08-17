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
          <p>{t("rules.actions.archiveBody")}</p>
          {archiveError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {archiveError}
            </p>
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
