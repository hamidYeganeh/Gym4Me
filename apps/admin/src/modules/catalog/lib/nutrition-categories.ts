import type { ChoiceGroup } from "@repo/api";
import { adminBasics } from "@/shared/lib/api";

export const NUTRITION_CATEGORY_CHOICE_KEY = "nutrition_category";

export type NutritionCategoryOption = {
  id: string;
  label: string;
};

export function nutritionCategoryOptionsFromGroups(
  groups: ChoiceGroup[],
): NutritionCategoryOption[] {
  const group = groups.find(
    (item) => item.value === NUTRITION_CATEGORY_CHOICE_KEY,
  );
  return (group?.options ?? [])
    .filter((option) => option.isActive !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((option) => ({
      id: option.value,
      label: option.name,
    }));
}

export function nutritionCategoryLabels(
  options: NutritionCategoryOption[],
): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.id, option.label]));
}

export async function loadNutritionCategoryOptions(): Promise<
  NutritionCategoryOption[]
> {
  const page = await adminBasics.listChoices();
  return nutritionCategoryOptionsFromGroups(page.result);
}
