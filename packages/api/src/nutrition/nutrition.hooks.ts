import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountNutritionApi,
  type AccountNutritionApi,
} from "./nutrition.client";
import type {
  CreateMealAdherenceInput,
  CreateMealPlanInput,
  FoodItemsPage,
  ListFoodItemsQuery,
  ListMealAdherenceQuery,
  ListMealPlansQuery,
  MealAdherencePage,
  MealPlan,
  MealPlansPage,
  UpdateMealPlanInput,
} from "./nutrition.dto";
import { accountNutritionKeys } from "./nutrition.keys";

function useAccountNutritionApi(): AccountNutritionApi {
  const client = useApiClient();
  return useMemo(() => createAccountNutritionApi(client), [client]);
}

export function useMealPlans(
  query: ListMealPlansQuery = {},
  options?: Omit<
    UseQueryOptions<MealPlansPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountNutritionApi();
  return useQuery({
    queryKey: accountNutritionKeys.mealPlans(query),
    queryFn: () => api.listMealPlans(query),
    ...options,
  });
}

export function useMealPlan(
  id: string,
  options?: Omit<UseQueryOptions<MealPlan, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountNutritionApi();
  return useQuery({
    queryKey: accountNutritionKeys.mealPlan(id),
    queryFn: () => api.getMealPlan(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useFoodItems(
  query: ListFoodItemsQuery = {},
  options?: Omit<
    UseQueryOptions<FoodItemsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountNutritionApi();
  return useQuery({
    queryKey: accountNutritionKeys.foodItems(query),
    queryFn: () => api.listFoodItems(query),
    ...options,
  });
}

export function useMealAdherence(
  query: ListMealAdherenceQuery = {},
  options?: Omit<
    UseQueryOptions<MealAdherencePage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountNutritionApi();
  return useQuery({
    queryKey: accountNutritionKeys.adherence(query),
    queryFn: () => api.listAdherence(query),
    ...options,
  });
}

export function useCreateMealPlan() {
  const api = useAccountNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMealPlanInput) => api.createMealPlan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountNutritionKeys.all,
      });
    },
  });
}

export function useUpdateMealPlan() {
  const api = useAccountNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMealPlanInput }) =>
      api.updateMealPlan(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountNutritionKeys.all,
      });
    },
  });
}

export function useDeleteMealPlan() {
  const api = useAccountNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMealPlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountNutritionKeys.all,
      });
    },
  });
}

export function useCreateMealAdherence() {
  const api = useAccountNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMealAdherenceInput) =>
      api.createAdherence(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountNutritionKeys.all,
      });
    },
  });
}
