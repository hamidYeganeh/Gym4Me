import type { ListFoodItemsQuery } from "./nutrition.dto";

export const adminNutritionKeys = {
  all: ["admin", "nutrition"] as const,
  foodItems: (query: ListFoodItemsQuery = {}) =>
    [...adminNutritionKeys.all, "food-items", query] as const,
};
