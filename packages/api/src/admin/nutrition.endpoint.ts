export const adminNutritionEndpoints = {
  foodItems: "/admin/nutrition/food-items",
  foodItem: (id: string) => `/admin/nutrition/food-items/${id}`,
} as const;
