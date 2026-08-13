import type {
  FoodItem,
  FoodItemMacrosInput,
  FoodItemsPage,
  FoodItemStatus,
  ListFoodItemsQuery,
} from "../nutrition/nutrition.dto";

export type CreateFoodItemInput = {
  name: string;
  categoryKey?: string;
  macros?: FoodItemMacrosInput;
  servingLabel?: string;
  status?: FoodItemStatus;
};

export type UpdateFoodItemInput = {
  name?: string;
  categoryKey?: string;
  macros?: FoodItemMacrosInput;
  servingLabel?: string;
  status?: FoodItemStatus;
};

export type {
  FoodItem,
  FoodItemsPage,
  FoodItemStatus,
  ListFoodItemsQuery,
};
