import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminNutritionApi,
  type AdminNutritionApi,
} from "./nutrition.client";
import type {
  CreateFoodItemInput,
  FoodItemsPage,
  ListFoodItemsQuery,
  UpdateFoodItemInput,
} from "./nutrition.dto";
import { adminNutritionKeys } from "./nutrition.keys";

function useAdminNutritionApi(): AdminNutritionApi {
  const client = useApiClient();
  return useMemo(() => createAdminNutritionApi(client), [client]);
}

export function useAdminFoodItems(
  query: ListFoodItemsQuery = {},
  options?: Omit<
    UseQueryOptions<FoodItemsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminNutritionApi();
  return useQuery({
    queryKey: adminNutritionKeys.foodItems(query),
    queryFn: () => api.listFoodItems(query),
    ...options,
  });
}

export function useCreateAdminFoodItem() {
  const api = useAdminNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFoodItemInput) => api.createFoodItem(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminNutritionKeys.all,
      });
    },
  });
}

export function useUpdateAdminFoodItem() {
  const api = useAdminNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateFoodItemInput;
    }) => api.updateFoodItem(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminNutritionKeys.all,
      });
    },
  });
}

export function useArchiveAdminFoodItem() {
  const api = useAdminNutritionApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveFoodItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminNutritionKeys.all,
      });
    },
  });
}
