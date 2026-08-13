import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  createMetricTypesFormSchema,
  METRIC_VALUE_KINDS,
  metricTypesFormDefaults,
  type MetricTypesFormValues,
} from "./MetricTypesForm.schema";
import { metricTypesFormVariants } from "./MetricTypesForm.styles";
import type { MetricTypesFormProps } from "./MetricTypesForm.types";

export function MetricTypesForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: MetricTypesFormProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const styles = metricTypesFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () =>
      createMetricTypesFormSchema(
        { required: tForm("validation.required") },
        isEdit,
      ),
    [isEdit, tForm],
  );
  const form = useForm<MetricTypesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: metricTypesFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? metricTypesFormDefaults);
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
      if (intent === "saveAndCreateNew") form.reset(metricTypesFormDefaults);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message || t("actionError") : t("actionError"),
      );
    }
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      {isEdit ? null : (
        <Controller
          control={form.control}
          name="key"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("metrics.fields.key")}</Label>
              <Input dir="ltr" ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      )}
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("metrics.fields.name")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="unit"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("metrics.fields.unit")}</Label>
            <Input dir="ltr" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="valueKind"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("metrics.fields.valueKind")}</Label>
            <div className={styles.chips()}>
              {METRIC_VALUE_KINDS.map((kind) => (
                <Button
                  key={kind}
                  size="sm"
                  type="button"
                  variant={field.value === kind ? "primary" : "secondary"}
                  onPress={() => field.onChange(kind)}
                >
                  {kind}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
      {submitError ? (
        <p className={styles.formError()} role="alert">
          {submitError}
        </p>
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
