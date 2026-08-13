import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  createPlatformPlansFormSchema,
  platformPlansFormDefaults,
  type PlatformPlansFormValues,
} from "./PlatformPlansForm.schema";
import { platformPlansFormVariants } from "./PlatformPlansForm.styles";
import type { PlatformPlansFormProps } from "./PlatformPlansForm.types";

export function PlatformPlansForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: PlatformPlansFormProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const styles = platformPlansFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () =>
      createPlatformPlansFormSchema(
        { required: tForm("validation.required") },
        isEdit,
      ),
    [isEdit, tForm],
  );
  const form = useForm<PlatformPlansFormValues>({
    resolver: zodResolver(schema),
    defaultValues: platformPlansFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? platformPlansFormDefaults);
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
      if (intent === "saveAndCreateNew") form.reset(platformPlansFormDefaults);
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
          name="code"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("plans.fields.code")}</Label>
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
            <Label>{t("plans.fields.name")}</Label>
            <Input ref={field.ref} />
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
            <Label>{t("plans.fields.description")}</Label>
            <TextArea className="min-h-20" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("plans.fields.amount")}</Label>
            <Input dir="ltr" inputMode="numeric" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="periodDays"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("plans.fields.periodDays")}</Label>
            <Input dir="ltr" inputMode="numeric" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="features"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("plans.fields.features")}</Label>
            <TextArea className="min-h-20" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
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
