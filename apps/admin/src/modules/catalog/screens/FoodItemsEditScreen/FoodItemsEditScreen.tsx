import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { FoodItem } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminNutrition } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  foodItemToFormValues,
  FoodItemsForm,
  parseMacro,
  type FoodItemsFormValues,
} from "../../components/FoodItemsForm";
import { foodItemsEditScreenVariants } from "./FoodItemsEditScreen.styles";
import type { FoodItemsEditScreenProps } from "./FoodItemsEditScreen.types";

export function FoodItemsEditScreen({ className }: FoodItemsEditScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const { foodId = "" } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const styles = foodItemsEditScreenVariants();
  const [item, setItem] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? foodItemToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!foodId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminNutrition.getFoodItem(foodId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("food.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [foodId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleEdit = async (values: FoodItemsFormValues, _intent: FormSubmitIntent) => {
    if (!item) return;
    await adminNutrition.updateFoodItem(item.id, {
      name: values.name.trim(),
      categoryKey: values.categoryKey.trim() || undefined,
      servingLabel: values.servingLabel.trim() || undefined,
      macros: {
        calories: parseMacro(values.calories),
        proteinG: parseMacro(values.protein),
        carbsG: parseMacro(values.carbs),
        fatG: parseMacro(values.fat),
      },
    });
    toast.success(tForm("saved"));
    navigate(routes.catalogFood);
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      breadcrumbs={[
        { label: item?.name ?? t("edit") },
        { label: t("edit") },
      ]}
      className={className}
    >
      <div className={styles.content()}>
        {loading ? (
          <div className={styles.status()}>
            <Spinner />
          </div>
        ) : null}
        {error ? (
          <Typography className={styles.error()} role="alert">
            {error}
          </Typography>
        ) : null}
        {item && initialValues ? (
          <AdminFormPage title={t("food.editTitle")}>
            <FoodItemsForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.catalogFood)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
