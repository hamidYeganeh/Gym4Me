import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { socialReportsResolveDrawerSectionVariants } from "./SocialReportsResolveDrawerSection.styles";
import type { SocialReportsResolveDrawerSectionProps } from "./SocialReportsResolveDrawerSection.types";

export function SocialReportsResolveDrawerSection({
  resolving,
  onOpenChange,
  note,
  onNoteChange,
  pending,
  actionError,
  onConfirm,
}: SocialReportsResolveDrawerSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = socialReportsResolveDrawerSectionVariants();

  return (
    <AdminFormDrawer
      isOpen={Boolean(resolving)}
      title={t("social.actions.resolveTitle")}
      onOpenChange={onOpenChange}
    >
      <div className={styles.form()}>
        <Typography className={styles.subtitle()}>
          {t("social.actions.resolveBody")}
        </Typography>
        <TextField
          className={styles.field()}
          fullWidth
          name="note"
          value={note}
          onChange={onNoteChange}
        >
          <Label>{t("social.actions.noteLabel")}</Label>
          <Input />
        </TextField>

        {actionError ? (
          <p className="text-sm text-danger" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className={styles.actions()}>
          <Button
            isDisabled={pending}
            variant={
              resolving?.resolution === "resolved" ? "primary" : "danger"
            }
            onPress={onConfirm}
          >
            {resolving?.resolution === "resolved"
              ? t("social.actions.resolve")
              : t("social.actions.reject")}
          </Button>
          <Button
            isDisabled={pending}
            variant="secondary"
            onPress={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </AdminFormDrawer>
  );
}
