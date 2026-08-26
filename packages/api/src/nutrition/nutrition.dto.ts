import type { Paginated, Privacy } from "../types";

export type MealPlanStatus = "draft" | "active" | "archived";

export type FoodItemStatus = "active" | "archived";

export type MealAdherenceStatus =
  | "followed"
  | "partial"
  | "skipped"
  | "substituted";

export type MealPlanItem = {
  title: string;
  foodItemId: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

export type MealPlanMeal = {
  name: string;
  items: MealPlanItem[];
};

export type MealPlanDay = {
  dayIndex: number;
  meals: MealPlanMeal[];
};

export type MealPlan = {
  id: string;
  athleteUserId: string;
  coachUserId: string | null;
  title: string;
  status: MealPlanStatus;
  privacy: Privacy;
  days: MealPlanDay[];
  createdAt: string;
  updatedAt: string;
};

export type MealPlanItemInput = {
  title: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  foodItemId?: string;
};

export type MealPlanMealInput = {
  name: string;
  items: MealPlanItemInput[];
};

export type MealPlanDayInput = {
  dayIndex: number;
  meals: MealPlanMealInput[];
};

export type CreateMealPlanInput = {
  athleteUserId?: string;
  title: string;
  status?: MealPlanStatus;
  privacy?: Privacy;
  days?: MealPlanDayInput[];
};

export type UpdateMealPlanInput = {
  title?: string;
  status?: MealPlanStatus;
  privacy?: Privacy;
  days?: MealPlanDayInput[];
};

export type ListMealPlansQuery = {
  page?: number;
  page_size?: number;
  status?: MealPlanStatus;
  athleteUserId?: string;
};

export type FoodItemMacros = {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

export type FoodItem = {
  id: string;
  name: string;
  categoryKey: string | null;
  macros: FoodItemMacros;
  servingLabel: string | null;
  status: FoodItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type FoodItemMacrosInput = {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

export type ListFoodItemsQuery = {
  page?: number;
  page_size?: number;
  status?: FoodItemStatus;
  search?: string;
};

export type MealAdherenceSlot = {
  dayIndex: number;
  mealIndex: number;
};

export type MealAdherence = {
  id: string;
  athleteUserId: string;
  mealPlanId: string;
  slot: MealAdherenceSlot;
  status: MealAdherenceStatus;
  loggedAt: string;
  privacy: Privacy;
  note: string | null;
  mediaId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMealAdherenceInput = {
  idempotencyKey: string;
  mealPlanId: string;
  slot: MealAdherenceSlot;
  status: MealAdherenceStatus;
  loggedAt?: string;
  note?: string;
  mediaId?: string;
};

export type ListMealAdherenceQuery = {
  page?: number;
  page_size?: number;
  mealPlanId?: string;
};

export type MealPlansPage = Paginated<MealPlan>;
export type FoodItemsPage = Paginated<FoodItem>;
export type MealAdherencePage = Paginated<MealAdherence>;
