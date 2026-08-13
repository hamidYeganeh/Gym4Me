import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminNutrition } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  FoodItemsForm,
  parseMacro,
  type FoodItemsFormValues,
} from "../../components/FoodItemsForm";
import { foodItemsCreateScreenVariants } from "./FoodItemsCreateScreen.styles";
import type { FoodItemsCreateScreenProps } from "./FoodItemsCreateScreen.types";

export function FoodItemsCreateScreen({ className }: FoodItemsCreateScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = foodItemsCreateScreenVariants();

  const handleCreate = async (values: FoodItemsFormValues, intent: FormSubmitIntent) => {
    await adminNutrition.createFoodItem({
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
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.catalogFood);
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("food.subtitle")} title={t("food.createTitle")}>
          <FoodItemsForm
            onCancel={() => navigate(routes.catalogFood)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
