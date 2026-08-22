import { useEffect, useMemo, useState, type Key } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { Switch } from "@heroui/react/switch";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions, AdminIconField } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { SPORT_PARENT_KIND } from "../../lib/basics-constants";
import { BasicsMediaField } from "../BasicsMediaField";
import {
  createSportsFormSchema,
  sportsFormDefaults,
  type SportsFormValues,
} from "./SportsForm.schema";
import { sportsFormVariants } from "./SportsForm.styles";
import type { SportsFormProps } from "./SportsForm.types";

export function SportsForm({
  kind,
  parents = [],
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: SportsFormProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const styles = sportsFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const parentKind = SPORT_PARENT_KIND[kind];
  const schema = useMemo(
    () => createSportsFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );
  const form = useForm<SportsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: sportsFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? sportsFormDefaults);
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
        form.reset({ ...sportsFormDefaults, parentId: values.parentId });
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message || t("errorSave") : t("errorSave"),
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
        name="slug"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.slug")}</Label>
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
      {!isEdit && parentKind ? (
        <Controller
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <Select
              value={field.value || "none"}
              onChange={(value: Key | Key[] | null) => {
                const next = String(value ?? "none");
                field.onChange(next === "none" ? "" : next);
              }}
            >
              <Label>{t("fields.parent")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="none" textValue={t("sports.noParent")}>
                    {t("sports.noParent")}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {parents.map((item) => (
                    <ListBox.Item
                      key={item.id}
                      id={item.id}
                      textValue={item.name}
                    >
                      {item.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          )}
        />
      ) : null}
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
            <Label>{t("fields.order")}</Label>
            <Input ref={field.ref} type="number" />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
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
