import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import { createInventoryApi } from "./inventory.client";
import type {
  CreateInventoryItemInput,
  ListInventoryQuery,
  UpdateInventoryItemInput,
} from "./inventory.dto";
import { inventoryKeys } from "./inventory.keys";

function useInventoryApi() {
  const client = useApiClient();
  return useMemo(() => createInventoryApi(client), [client]);
}

export function useInventory(clubId: string, query: ListInventoryQuery = {}) {
  const api = useInventoryApi();
  return useQuery({
    queryKey: inventoryKeys.list(clubId, query),
    queryFn: () => api.list(clubId, query),
    enabled: Boolean(clubId),
  });
}

export function useCreateInventoryItem(clubId: string) {
  const api = useInventoryApi();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInventoryItemInput) => api.create(clubId, input),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}

export function useUpdateInventoryItem(clubId: string, itemId: string) {
  const api = useInventoryApi();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateInventoryItemInput) =>
      api.update(clubId, itemId, input),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}

export function useArchiveInventoryItem(clubId: string, itemId: string) {
  const api = useInventoryApi();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (expectedVersion: number) =>
      api.archive(clubId, itemId, expectedVersion),
    onSuccess: () =>
      cache.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}
