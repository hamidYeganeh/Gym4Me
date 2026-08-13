import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  createFoodItemsFormSchema,
  foodItemsFormDefaults,
  type FoodItemsFormValues,
} from "./FoodItemsForm.schema";
import { foodItemsFormVariants } from "./FoodItemsForm.styles";
import type { FoodItemsFormProps } from "./FoodItemsForm.types";

export function FoodItemsForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: FoodItemsFormProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const styles = foodItemsFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () => createFoodItemsFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );
  const form = useForm<FoodItemsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: foodItemsFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? foodItemsFormDefaults);
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
      if (intent === "saveAndCreateNew") form.reset(foodItemsFormDefaults);
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
            <Label>{t("food.fields.name")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="categoryKey"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("food.fields.categoryKey")}</Label>
            <Input dir="ltr" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="servingLabel"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("food.fields.servingLabel")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <div className={styles.macroGrid()}>
        {(["calories", "protein", "carbs", "fat"] as const).map((name) => (
          <Controller
            key={name}
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                <Label>{t(`food.fields.${name}`)}</Label>
                <Input dir="ltr" inputMode="decimal" ref={field.ref} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
        ))}
      </div>
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
