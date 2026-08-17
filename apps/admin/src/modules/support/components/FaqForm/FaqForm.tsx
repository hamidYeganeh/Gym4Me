import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { FAQ_AUDIENCES, PUBLISH_STATUSES } from "../../lib/support-constants";
import {
  createFaqFormSchema,
  faqFormDefaults,
  type FaqFormValues,
} from "./FaqForm.schema";
import { faqFormVariants } from "./FaqForm.styles";
import type { FaqFormProps } from "./FaqForm.types";

export function FaqForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: FaqFormProps) {
  const t = useTranslations("Admin.Support");
  const tForm = useTranslations("Admin.Form");
  const styles = faqFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const schema = useMemo(
    () => createFaqFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(schema),
    defaultValues: faqFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? faqFormDefaults);
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
      if (intent === "saveAndCreateNew") {
        form.reset(faqFormDefaults);
      }
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
        name="question"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("faqColumns.question")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="answer"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("faqFields.answer")}</Label>
            <TextArea className="min-h-32" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="audience"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("faqColumns.audience")}</Label>
            <div className={styles.chips()}>
              {FAQ_AUDIENCES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`audience.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="publishStatus"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("faqColumns.publishStatus")}</Label>
            <div className={styles.chips()}>
              {PUBLISH_STATUSES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`publishStatus.${value}`)}
                </Button>
              ))}
            </div>
          </div>
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
            <Label>{t("faqColumns.order")}</Label>
            <Input inputMode="numeric" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

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
