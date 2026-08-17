import { Button, Input, Label, TextField } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog, AdminFormDrawer } from "@/shared/components";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { achievementsListModalsSectionVariants } from "./AchievementsListModalsSection.styles";
import type { AchievementsListModalsSectionProps } from "./AchievementsListModalsSection.types";

export function AchievementsListModalsSection({
  granting,
  onGrantingOpenChange,
  grantSubjectType,
  onGrantSubjectTypeChange,
  grantSubjectId,
  onGrantSubjectIdChange,
  grantPending,
  grantError,
  grantDone,
  onGrantConfirm,
  archiving,
  onArchivingOpenChange,
  archivePending,
  archiveError,
  onArchiveConfirm,
}: AchievementsListModalsSectionProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = achievementsListModalsSectionVariants();

  return (
    <>
      <AdminFormDrawer
        className="max-w-xl sm:max-w-xl"
        isOpen={Boolean(granting)}
        title={t("achievements.actions.grantTitle", {
          title: granting?.title ?? "",
        })}
        onOpenChange={onGrantingOpenChange}
      >
        <div className={styles.form()}>
          <div className={styles.field()}>
            <Label>{t("achievements.fields.subjectType")}</Label>
            <div className={styles.chips()}>
              {(granting?.audience ?? SUBJECT_TYPES).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={grantSubjectType === value ? "primary" : "secondary"}
                  onPress={() => onGrantSubjectTypeChange(value)}
                >
                  {t(`subjects.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            className={styles.field()}
            fullWidth
            name="subjectId"
            value={grantSubjectId}
            onChange={onGrantSubjectIdChange}
          >
            <Label>{t("achievements.fields.subjectId")}</Label>
            <Input
              dir="ltr"
              placeholder={t("achievements.fields.subjectIdHint")}
            />
          </TextField>

          {grantError ? (
            <p className="text-sm text-danger" role="alert">
              {grantError}
            </p>
          ) : null}
          {grantDone ? (
            <p className="text-sm text-success" role="status">
              {t("achievements.actions.grantDone")}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={grantPending || !grantSubjectId.trim()}
              variant="primary"
              onPress={onGrantConfirm}
            >
              {t("actions.grant")}
            </Button>
            <Button
              isDisabled={grantPending}
              variant="secondary"
              onPress={() => onGrantingOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("achievements.actions.archiveBody")}</p>
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
        title={t("achievements.actions.archiveTitle")}
        onConfirm={onArchiveConfirm}
        onOpenChange={onArchivingOpenChange}
      />
    </>
  );
}
