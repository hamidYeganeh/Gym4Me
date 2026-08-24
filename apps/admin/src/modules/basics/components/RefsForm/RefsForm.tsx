import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Switch } from "@heroui/react/switch";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions, AdminIconField } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { BasicsMediaField } from "../BasicsMediaField";
import {
  createRefsFormSchema,
  REF_STATUSES,
  refsFormDefaults,
  type RefsFormValues,
} from "./RefsForm.schema";
import { refsFormVariants } from "./RefsForm.styles";
import type { RefsFormProps } from "./RefsForm.types";

export function RefsForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: RefsFormProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const styles = refsFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () => createRefsFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );
  const form = useForm<RefsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: refsFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? refsFormDefaults);
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
      if (intent === "saveAndCreateNew") form.reset(refsFormDefaults);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || t("errorSave")
          : t("errorSave"),
      );
    }
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
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
            <Label>{t("fields.name")}</Label>
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
            <Label>{t("fields.description")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="icon"
        render={({ field, fieldState }) => (
          <AdminIconField
            errorMessage={fieldState.error?.message}
            inputRef={field.ref}
            isInvalid={fieldState.invalid}
            label={t("fields.icon")}
            name={field.name}
            placeholder={t("fields.iconHint")}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={form.control}
        name="coverMediaId"
        render={({ field }) => (
          <BasicsMediaField
            disabled={form.formState.isSubmitting}
            errorMessage={t("media.error")}
            hint={t("fields.mediaHint")}
            label={t("fields.media")}
            removeLabel={t("media.remove")}
            retryLabel={t("media.retry")}
            successMessage={t("media.success")}
            uploaderButtonLabel={t("media.uploaderButton")}
            uploaderDescription={t("media.uploaderDescription")}
            uploaderTitle={t("media.uploaderTitle")}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {isEdit ? (
        <Card variant="secondary">
          <Card.Header>
            <Card.Title>وضعیت نمایش</Card.Title>
            <Card.Description>
              مشخص کنید این مورد در اپ برای کاربران قابل انتخاب باشد یا نه.
            </Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <div className={styles.field()}>
                  <Label>{t("fields.status")}</Label>
                  <div className={styles.chips()}>
                    {REF_STATUSES.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        type="button"
                        variant={
                          field.value === status ? "primary" : "secondary"
                        }
                        onPress={() => field.onChange(status)}
                      >
                        {t(`refStatuses.${status}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch isSelected={field.value} onChange={field.onChange}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    {t("fields.isActive")}
                  </Switch.Content>
                </Switch>
              )}
            />
          </Card.Content>
        </Card>
      ) : null}
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
