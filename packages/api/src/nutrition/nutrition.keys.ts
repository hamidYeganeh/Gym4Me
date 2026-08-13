import type {
  ListFoodItemsQuery,
  ListMealAdherenceQuery,
  ListMealPlansQuery,
} from "./nutrition.dto";

export const accountNutritionKeys = {
  all: ["account", "nutrition"] as const,
  mealPlans: (query: ListMealPlansQuery = {}) =>
    [...accountNutritionKeys.all, "meal-plans", query] as const,
  mealPlan: (id: string) =>
    [...accountNutritionKeys.all, "meal-plan", id] as const,
  foodItems: (query: ListFoodItemsQuery = {}) =>
    [...accountNutritionKeys.all, "food-items", query] as const,
  adherence: (query: ListMealAdherenceQuery = {}) =>
    [...accountNutritionKeys.all, "adherence", query] as const,
};
