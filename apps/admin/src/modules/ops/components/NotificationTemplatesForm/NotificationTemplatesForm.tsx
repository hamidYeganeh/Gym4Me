import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  CHANNEL_OPTIONS,
  createNotificationTemplatesFormSchema,
  notificationTemplatesFormDefaults,
  SMS_OPTIONS,
  type NotificationTemplatesFormValues,
} from "./NotificationTemplatesForm.schema";
import { notificationTemplatesFormVariants } from "./NotificationTemplatesForm.styles";
import type { NotificationTemplatesFormProps } from "./NotificationTemplatesForm.types";

export function NotificationTemplatesForm({
  onCancel,
  onSubmit,
  initialValues = null,
  className,
}: NotificationTemplatesFormProps) {
  const t = useTranslations("Admin.Ops");
  const tForm = useTranslations("Admin.Form");
  const styles = notificationTemplatesFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(
    () =>
      createNotificationTemplatesFormSchema({
        required: tForm("validation.required"),
      }),
    [tForm],
  );
  const form = useForm<NotificationTemplatesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: notificationTemplatesFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? notificationTemplatesFormDefaults);
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
            <Label>{t("templates.fields.title")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="body"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("templates.fields.body")}</Label>
            <TextArea className="min-h-28" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="smsTemplateKey"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("templates.fields.smsTemplateKey")}</Label>
            <Input dir="ltr" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="push"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("templates.fields.push")}</Label>
            <div className={styles.chips()}>
              {CHANNEL_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  type="button"
                  variant={field.value === option ? "primary" : "secondary"}
                  onPress={() => field.onChange(option)}
                >
                  {t(`templates.channelOptions.${option}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
      <Controller
        control={form.control}
        name="inbox"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("templates.fields.inbox")}</Label>
            <div className={styles.chips()}>
              {CHANNEL_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  type="button"
                  variant={field.value === option ? "primary" : "secondary"}
                  onPress={() => field.onChange(option)}
                >
                  {t(`templates.channelOptions.${option}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
      <Controller
        control={form.control}
        name="sms"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("templates.fields.sms")}</Label>
            <div className={styles.chips()}>
              {SMS_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  type="button"
                  variant={field.value === option ? "primary" : "secondary"}
                  onPress={() => field.onChange(option)}
                >
                  {t(`templates.smsOptions.${option}`)}
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
        saveLabel={tForm("save")}
        onCancel={onCancel}
      />
    </form>
  );
}
