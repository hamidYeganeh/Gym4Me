import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { coachProgramsCreateFormSectionVariants } from "./CoachProgramsCreateFormSection.styles";
import type { CoachProgramsCreateFormSectionProps } from "./CoachProgramsCreateFormSection.types";

export function CoachProgramsCreateFormSection({
  title,
  focusLabel,
  creating = false,
  createError = null,
  onTitleChange,
  onFocusLabelChange,
  onCancel,
  onSubmit,
  className,
}: CoachProgramsCreateFormSectionProps) {
  const t = useTranslations("CoachPrograms");
  const styles = coachProgramsCreateFormSectionVariants();

  return (
    <form
      className={styles.root({ className })}
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return;
        onSubmit();
      }}
    >
      <TextField>
        <Label>{t("createTitleLabel")}</Label>
        <Input
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={t("createTitlePlaceholder")}
          value={title}
        />
      </TextField>
      <TextField>
        <Label>{t("createFocusLabel")}</Label>
        <Input
          onChange={(event) => onFocusLabelChange(event.target.value)}
          placeholder={t("createFocusPlaceholder")}
          value={focusLabel}
        />
      </TextField>
      {createError ? (
        <Typography className="text-danger" type="body-sm">
          {t("createError")}
        </Typography>
      ) : null}
      <div className={styles.actions()}>
        <Button isDisabled={creating} onPress={onCancel} variant="ghost">
          {t("createCancel")}
        </Button>
        <Button
          isDisabled={creating || !title.trim()}
          type="submit"
          variant="primary"
        >
          {creating ? t("creating") : t("createSubmit")}
        </Button>
      </div>
    </form>
  );
}
