import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  ACHIEVEMENT_METRICS,
  GRANT_MODES,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";
import {
  achievementsFormDefaults,
  createAchievementsFormSchema,
  type AchievementsFormValues,
} from "./AchievementsForm.schema";
import { achievementsFormVariants } from "./AchievementsForm.styles";
import type { AchievementsFormProps } from "./AchievementsForm.types";

export function AchievementsForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: AchievementsFormProps) {
  const t = useTranslations("Admin.Gamification");
  const tForm = useTranslations("Admin.Form");
  const styles = achievementsFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () =>
      createAchievementsFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );
  const form = useForm<AchievementsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: achievementsFormDefaults,
  });
  const grantMode = form.watch("grantMode");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? achievementsFormDefaults);
      setSubmitError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [form, initialValues]);

  const handleSubmit = form.handleSubmit(async (values, event) => {
    const intent = resolveFormSubmitIntent(event);
    setSubmitError(null);
    try {
      await onSubmit(values, intent);
      if (intent === "saveAndCreateNew") form.reset(achievementsFormDefaults);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message || t("actionError") : t("actionError"),
      );
    }
  });

  const toggleAudience = (
    current: AchievementsFormValues["audience"],
    value: AchievementsFormValues["audience"][number],
  ) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("achievements.fields.title")}</Label>
            <Input
              placeholder={t("achievements.fields.titleHint")}
              ref={field.ref}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("achievements.fields.description")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="icon"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("achievements.fields.icon")}</Label>
            <Input
              dir="ltr"
              placeholder={t("achievements.fields.iconHint")}
              ref={field.ref}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="audience"
        render={({ field, fieldState }) => (
          <div className={styles.field()}>
            <Label>{t("achievements.fields.audience")}</Label>
            <div className={styles.chips()}>
              {SUBJECT_TYPES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value.includes(value) ? "primary" : "secondary"}
                  onPress={() => field.onChange(toggleAudience(field.value, value))}
                >
                  {t(`subjects.${value}`)}
                </Button>
              ))}
            </div>
            {fieldState.error ? (
              <Typography className={styles.formError()}>{fieldState.error.message}</Typography>
            ) : null}
          </div>
        )}
      />
      <Controller
        control={form.control}
        name="grantMode"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("achievements.fields.grantMode")}</Label>
            <div className={styles.chips()}>
              {GRANT_MODES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`grantModes.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
      {grantMode === "automatic" ? (
        <>
          <Controller
            control={form.control}
            name="metric"
            render={({ field }) => (
              <div className={styles.field()}>
                <Label>{t("achievements.fields.metric")}</Label>
                <div className={styles.chips()}>
                  {ACHIEVEMENT_METRICS.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      type="button"
                      variant={field.value === value ? "primary" : "secondary"}
                      onPress={() => field.onChange(value)}
                    >
                      {t(`metrics.${value}`)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="threshold"
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                isRequired
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                <Label>{t("achievements.fields.threshold")}</Label>
                <Input inputMode="numeric" ref={field.ref} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
        </>
      ) : null}
      <div className={styles.formRow()}>
        <Controller
          control={form.control}
          name="bonusPoints"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("achievements.fields.bonusPoints")}</Label>
              <Input inputMode="numeric" ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={form.control}
          name="order"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("achievements.fields.order")}</Label>
              <Input inputMode="numeric" ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      </div>
      {submitError ? (
        <Typography className={styles.formError()} role="alert">
          {submitError}
        </Typography>
      ) : null}
      <AdminFormActions
        cancelLabel={t("cancel")}
        isPending={form.formState.isSubmitting}
        saveAndCreateNewLabel={tForm("saveAndCreateNew")}
        saveLabel={tForm("save")}
        showSaveAndCreateNew={!isEdit}
        onCancel={onCancel}
      />
    </form>
  );
}
