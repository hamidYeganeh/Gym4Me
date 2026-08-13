export const accountNutritionEndpoints = {
  mealPlans: "/account/nutrition/meal-plans",
  mealPlan: (id: string) => `/account/nutrition/meal-plans/${id}`,
  foodItems: "/account/nutrition/food-items",
  adherence: "/account/nutrition/adherence",
} as const;
