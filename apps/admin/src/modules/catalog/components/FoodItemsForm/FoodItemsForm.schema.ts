import { z } from "zod";
import type { FoodItem } from "@repo/api";

export type FoodItemsFormMessages = { required: string };

export function createFoodItemsFormSchema(messages: FoodItemsFormMessages) {
  return z.object({
    name: z.string().trim().min(1, messages.required),
    categoryKey: z.string(),
    servingLabel: z.string(),
    calories: z.string(),
    protein: z.string(),
    carbs: z.string(),
    fat: z.string(),
  });
}

export type FoodItemsFormValues = z.infer<
  ReturnType<typeof createFoodItemsFormSchema>
>;

export const foodItemsFormDefaults: FoodItemsFormValues = {
  name: "",
  categoryKey: "",
  servingLabel: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

export function foodItemToFormValues(item: FoodItem): FoodItemsFormValues {
  return {
    name: item.name,
    categoryKey: item.categoryKey ?? "",
    servingLabel: item.servingLabel ?? "",
    calories: item.macros.calories != null ? String(item.macros.calories) : "",
    protein: item.macros.proteinG != null ? String(item.macros.proteinG) : "",
    carbs: item.macros.carbsG != null ? String(item.macros.carbsG) : "",
    fat: item.macros.fatG != null ? String(item.macros.fatG) : "",
  };
}

export function parseMacro(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
