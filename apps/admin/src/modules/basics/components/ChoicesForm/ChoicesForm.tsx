import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Switch,
  TextField,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { Plus, Trash2 } from "@repo/icons";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  choicesFormDefaults,
  createChoicesFormSchema,
  emptyChoiceOption,
  type ChoicesFormValues,
} from "./ChoicesForm.schema";
import { choicesFormVariants } from "./ChoicesForm.styles";
import type { ChoicesFormProps } from "./ChoicesForm.types";

export function ChoicesForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: ChoicesFormProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const styles = choicesFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () =>
      createChoicesFormSchema(
        {
          required: tForm("validation.required"),
          options: t("choices.errorOptions"),
        },
        isEdit,
      ),
    [isEdit, t, tForm],
  );
  const form = useForm<ChoicesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: choicesFormDefaults,
  });
  const options = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? choicesFormDefaults);
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
      if (intent === "saveAndCreateNew") form.reset(choicesFormDefaults);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message || t("errorSave") : t("errorSave"),
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
              <Label>{t("fields.key")}</Label>
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
      <div className={styles.optionsList()}>
        <div className="flex items-center justify-between gap-3">
          <Typography weight="semibold">{t("fields.options")}</Typography>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onPress={() => options.append(emptyChoiceOption(options.fields.length))}
          >
            <Plus size={16} />
            {t("choices.addOption")}
          </Button>
        </div>
        {options.fields.map((option, index) => (
          <div className={styles.optionRow()} key={option.id}>
            <Controller
              control={form.control}
              name={`options.${index}.value`}
              render={({ field, fieldState }) => (
                <TextField
                  isInvalid={fieldState.invalid}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                >
                  <Label>{t("fields.optionValue")}</Label>
                  <Input ref={field.ref} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name={`options.${index}.name`}
              render={({ field, fieldState }) => (
                <TextField
                  isInvalid={fieldState.invalid}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                >
                  <Label>{t("fields.optionName")}</Label>
                  <Input ref={field.ref} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
            <div className={styles.optionActions()}>
              <Controller
                control={form.control}
                name={`options.${index}.isActive`}
                render={({ field }) => (
                  <Switch isSelected={field.value} onChange={field.onChange}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                )}
              />
              {options.fields.length > 1 ? (
                <Button
                  aria-label={t("choices.removeOption")}
                  isIconOnly
                  size="lg"
                  type="button"
                  variant="ghost"
                  onPress={() => options.remove(index)}
                >
                  <Trash2 size={16} />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {form.formState.errors.options?.root?.message ||
        form.formState.errors.options?.message ? (
          <Typography className={styles.formError()} role="alert">
            {form.formState.errors.options.root?.message ??
              form.formState.errors.options.message}
          </Typography>
        ) : null}
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
