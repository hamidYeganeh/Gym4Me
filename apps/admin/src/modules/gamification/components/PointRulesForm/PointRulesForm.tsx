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
  POINT_RULE_EVENTS,
  POINT_RULE_REPEATS,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";
import {
  createPointRulesFormSchema,
  pointRulesFormDefaults,
  type PointRulesFormValues,
} from "./PointRulesForm.schema";
import { pointRulesFormVariants } from "./PointRulesForm.styles";
import type { PointRulesFormProps } from "./PointRulesForm.types";

export function PointRulesForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: PointRulesFormProps) {
  const t = useTranslations("Admin.Gamification");
  const tForm = useTranslations("Admin.Form");
  const styles = pointRulesFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () => createPointRulesFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );
  const form = useForm<PointRulesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: pointRulesFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? pointRulesFormDefaults);
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
      if (intent === "saveAndCreateNew") form.reset(pointRulesFormDefaults);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message || t("actionError") : t("actionError"),
      );
    }
  });

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
            <Label>{t("rules.fields.title")}</Label>
            <Input placeholder={t("rules.fields.titleHint")} ref={field.ref} />
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
            <Label>{t("rules.fields.description")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="event"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("rules.fields.event")}</Label>
            <div className={styles.chips()}>
              {POINT_RULE_EVENTS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`events.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
      <div className={styles.field()}>
        <Label>{t("rules.fields.awards")}</Label>
        <Typography className={styles.hint()}>
          {t("rules.fields.awardsHint")}
        </Typography>
        <div className={styles.awardsGrid()}>
          {SUBJECT_TYPES.map((subjectType) => (
            <Controller
              key={subjectType}
              control={form.control}
              name={`awards.${subjectType}`}
              render={({ field, fieldState }) => (
                <TextField
                  isInvalid={fieldState.invalid}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                >
                  <Label>{t(`subjects.${subjectType}`)}</Label>
                  <Input inputMode="numeric" placeholder="—" ref={field.ref} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
          ))}
        </div>
      </div>
      <Controller
        control={form.control}
        name="repeat"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("rules.fields.repeat")}</Label>
            <div className={styles.chips()}>
              {POINT_RULE_REPEATS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`repeats.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
      <Controller
        control={form.control}
        name="dailyCap"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("rules.fields.dailyCap")}</Label>
            <Input
              inputMode="numeric"
              placeholder={t("rules.fields.dailyCapHint")}
              ref={field.ref}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <div className={styles.formRow()}>
        <Controller
          control={form.control}
          name="effectiveFrom"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("rules.fields.effectiveFrom")}</Label>
              <Input dir="ltr" ref={field.ref} type="datetime-local" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={form.control}
          name="effectiveTo"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("rules.fields.effectiveTo")}</Label>
              <Input dir="ltr" ref={field.ref} type="datetime-local" />
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
