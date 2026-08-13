import type { ApiClient } from "../client";
import { accountNutritionEndpoints as ep } from "./nutrition.endpoint";
import type {
  CreateMealAdherenceInput,
  CreateMealPlanInput,
  FoodItemsPage,
  ListFoodItemsQuery,
  ListMealAdherenceQuery,
  ListMealPlansQuery,
  MealAdherence,
  MealAdherencePage,
  MealPlan,
  MealPlansPage,
  UpdateMealPlanInput,
} from "./nutrition.dto";

export function createAccountNutritionApi(client: ApiClient) {
  return {
    listMealPlans(query: ListMealPlansQuery = {}) {
      return client.request<MealPlansPage>(ep.mealPlans, { query });
    },

    getMealPlan(id: string) {
      return client.request<MealPlan>(ep.mealPlan(id));
    },

    createMealPlan(input: CreateMealPlanInput) {
      return client.request<MealPlan>(ep.mealPlans, {
        method: "POST",
        body: input,
      });
    },

    updateMealPlan(id: string, input: UpdateMealPlanInput) {
      return client.request<MealPlan>(ep.mealPlan(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteMealPlan(id: string) {
      return client.request<MealPlan>(ep.mealPlan(id), {
        method: "DELETE",
      });
    },

    listFoodItems(query: ListFoodItemsQuery = {}) {
      return client.request<FoodItemsPage>(ep.foodItems, { query });
    },

    listAdherence(query: ListMealAdherenceQuery = {}) {
      return client.request<MealAdherencePage>(ep.adherence, { query });
    },

    createAdherence(input: CreateMealAdherenceInput) {
      return client.request<MealAdherence>(ep.adherence, {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountNutritionApi = ReturnType<typeof createAccountNutritionApi>;
