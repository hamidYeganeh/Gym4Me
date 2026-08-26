import { useEffect, useMemo, useState, type Key } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Checkbox } from "@heroui/react/checkbox";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
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
        name="tax"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("plans.fields.tax")}</Label>
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
      <Typography type="h4" weight="semibold">
        {t("plans.entitlements.title")}
      </Typography>
      <Controller
        control={form.control}
        name="audience"
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={(value: Key | Key[] | null) => field.onChange(String(value))}
          >
            <Label>{t("plans.fields.audience")}</Label>
            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="club_owner" textValue={t("plans.audience.owner")}>
                  {t("plans.audience.owner")}<ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="coach" textValue={t("plans.audience.coach")}>
                  {t("plans.audience.coach")}<ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />
      <Controller
        control={form.control}
        name="capabilities"
        render={({ field, fieldState }) => (
          <TextField isInvalid={fieldState.invalid} name={field.name} value={field.value} onBlur={field.onBlur} onChange={field.onChange}>
            <Label>{t("plans.fields.capabilities")}</Label>
            <TextArea className="min-h-20" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      {([
        ["graceDays", "graceDays"],
        ["clubsLimit", "clubsLimit"],
        ["staffLimit", "staffLimit"],
        ["membersLimit", "membersLimit"],
        ["messagesLimit", "messagesLimit"],
        ["studentsLimit", "studentsLimit"],
      ] as const).map(([name, label]) => (
        <Controller
          control={form.control}
          key={name}
          name={name}
          render={({ field, fieldState }) => (
            <TextField isInvalid={fieldState.invalid} name={field.name} value={field.value} onBlur={field.onBlur} onChange={field.onChange}>
              <Label>{t(`plans.fields.${label}`)}</Label>
              <Input dir="ltr" inputMode="numeric" ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      ))}
      <Controller
        control={form.control}
        name="postExpirationMode"
        render={({ field }) => (
          <Select value={field.value} onChange={(value: Key | Key[] | null) => field.onChange(String(value))}>
            <Label>{t("plans.fields.postExpirationMode")}</Label>
            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="read_only" textValue={t("plans.expiration.readOnly")}>
                  {t("plans.expiration.readOnly")}<ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="free_plan" textValue={t("plans.expiration.freePlan")}>
                  {t("plans.expiration.freePlan")}<ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />
      <Controller
        control={form.control}
        name="fallbackPlanId"
        render={({ field, fieldState }) => (
          <TextField isInvalid={fieldState.invalid} name={field.name} value={field.value} onBlur={field.onBlur} onChange={field.onChange}>
            <Label>{t("plans.fields.fallbackPlanId")}</Label>
            <Input dir="ltr" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="contractReady"
        render={({ field }) => (
          <Checkbox isSelected={field.value} onChange={field.onChange}>
            {t("plans.fields.contractReady")}
          </Checkbox>
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
