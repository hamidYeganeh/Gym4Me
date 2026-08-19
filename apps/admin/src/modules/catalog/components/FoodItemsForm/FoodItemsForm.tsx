import { useEffect, useMemo, useState, type Key } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { Spinner } from "@heroui/react/spinner";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  loadNutritionCategoryOptions,
  type NutritionCategoryOption,
} from "../../lib/nutrition-categories";
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
  const [categoryOptions, setCategoryOptions] = useState<
    NutritionCategoryOption[]
  >([]);
  const [categoryStatus, setCategoryStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
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

  useEffect(() => {
    let cancelled = false;
    setCategoryStatus("loading");
    void (async () => {
      try {
        const next = await loadNutritionCategoryOptions();
        if (cancelled) return;
        setCategoryOptions(next);
        setCategoryStatus("ready");
      } catch {
        if (cancelled) return;
        setCategoryOptions([]);
        setCategoryStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryChoices = useMemo(() => {
    const current = initialValues?.categoryKey.trim() ?? "";
    if (current && !categoryOptions.some((option) => option.id === current)) {
      return [{ id: current, label: current }, ...categoryOptions];
    }
    return categoryOptions;
  }, [categoryOptions, initialValues?.categoryKey]);

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
      {categoryStatus === "loading" ? (
        <div className={styles.status()}>
          <Spinner />
        </div>
      ) : null}
      {categoryStatus === "error" ? (
        <Typography className={styles.statusText()} role="alert">
          {t("food.fields.categoryError")}
        </Typography>
      ) : null}
      {categoryStatus === "ready" && categoryChoices.length === 0 ? (
        <Typography className={styles.statusText()}>
          {t("food.fields.categoryEmpty")}
        </Typography>
      ) : null}
      {categoryStatus === "ready" && categoryChoices.length > 0 ? (
        <Controller
          control={form.control}
          name="categoryKey"
          render={({ field }) => (
            <Select
              className={styles.select()}
              placeholder={t("food.fields.categoryNone")}
              value={field.value || "none"}
              onChange={(value: Key | Key[] | null) => {
                const next = String(value ?? "none");
                field.onChange(next === "none" ? "" : next);
              }}
            >
              <Label>{t("food.fields.categoryKey")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item
                    id="none"
                    textValue={t("food.fields.categoryNone")}
                  >
                    {t("food.fields.categoryNone")}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {categoryChoices.map((option) => (
                    <ListBox.Item
                      key={option.id}
                      id={option.id}
                      textValue={option.label}
                    >
                      {option.label}
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
