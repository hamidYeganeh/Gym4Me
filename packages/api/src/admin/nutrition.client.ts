import type { ApiClient } from "../client";
import { adminNutritionEndpoints as ep } from "./nutrition.endpoint";
import type {
  CreateFoodItemInput,
  FoodItem,
  FoodItemsPage,
  ListFoodItemsQuery,
  UpdateFoodItemInput,
} from "./nutrition.dto";

export function createAdminNutritionApi(client: ApiClient) {
  return {
    listFoodItems(query: ListFoodItemsQuery = {}) {
      return client.request<FoodItemsPage>(ep.foodItems, { query });
    },

    createFoodItem(input: CreateFoodItemInput) {
      return client.request<FoodItem>(ep.foodItems, {
        method: "POST",
        body: input,
      });
    },

    updateFoodItem(id: string, input: UpdateFoodItemInput) {
      return client.request<FoodItem>(ep.foodItem(id), {
        method: "PATCH",
        body: input,
      });
    },

    archiveFoodItem(id: string) {
      return client.request<FoodItem>(ep.foodItem(id), {
        method: "DELETE",
      });
    },
  };
}

export type AdminNutritionApi = ReturnType<typeof createAdminNutritionApi>;
