import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type {
  ChoiceGroup,
  ItemsResponse,
  LocationNode,
  RefItem,
  RefType,
  SportNode,
  SuccessResponse,
} from "../types";
import { createAdminBasicsApi, type AdminBasicsApi } from "./basics.client";
import type {
  AdminCreateChoiceGroupInput,
  AdminCreateLocationInput,
  AdminCreateRefItemInput,
  AdminCreateSportInput,
  AdminRefListResponse,
  AdminUpdateChoiceGroupInput,
  AdminUpdateLocationInput,
  AdminUpdateRefItemInput,
  AdminUpdateSportInput,
  ListAdminLocationsQuery,
  ListAdminSportsQuery,
} from "./basics.dto";
import { adminBasicsKeys } from "./basics.keys";

function useAdminBasicsApi(): AdminBasicsApi {
  const client = useApiClient();
  return useMemo(() => createAdminBasicsApi(client), [client]);
}

export function useAdminChoicesList(
  options?: Omit<
    UseQueryOptions<ItemsResponse<ChoiceGroup>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.choices(),
    queryFn: () => api.listChoices(),
    ...options,
  });
}

export function useCreateAdminChoice(
  options?: UseMutationOptions<
    ChoiceGroup,
    Error,
    AdminCreateChoiceGroupInput
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createChoice(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.choices(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminChoice(
  options?: UseMutationOptions<
    ChoiceGroup,
    Error,
    { key: string; input: AdminUpdateChoiceGroupInput }
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ key, input }) => api.updateChoice(key, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.choices(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAdminChoice(
  options?: UseMutationOptions<SuccessResponse, Error, string>,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (key) => api.deleteChoice(key),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.choices(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminLocationsList(
  query: ListAdminLocationsQuery,
  options?: Omit<
    UseQueryOptions<ItemsResponse<LocationNode>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.locationList(query),
    queryFn: () => api.listLocations(query),
    ...options,
  });
}

export function useAdminLocation(
  id: string,
  options?: Omit<UseQueryOptions<LocationNode, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.locationDetail(id),
    queryFn: () => api.getLocation(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAdminLocation(
  options?: UseMutationOptions<LocationNode, Error, AdminCreateLocationInput>,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createLocation(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.locations(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminLocation(
  options?: UseMutationOptions<
    LocationNode,
    Error,
    { id: string; input: AdminUpdateLocationInput }
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updateLocation(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.locationDetail(vars.id),
      });
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.locations(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAdminLocation(
  options?: UseMutationOptions<SuccessResponse, Error, string>,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (id) => api.deleteLocation(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.locations(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminSportsList(
  query: ListAdminSportsQuery = {},
  options?: Omit<
    UseQueryOptions<ItemsResponse<SportNode>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.sportList(query),
    queryFn: () => api.listSports(query),
    ...options,
  });
}

export function useAdminSport(
  id: string,
  options?: Omit<UseQueryOptions<SportNode, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.sportDetail(id),
    queryFn: () => api.getSport(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAdminSport(
  options?: UseMutationOptions<SportNode, Error, AdminCreateSportInput>,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createSport(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.sports(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminSport(
  options?: UseMutationOptions<
    SportNode,
    Error,
    { id: string; input: AdminUpdateSportInput }
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updateSport(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.sportDetail(vars.id),
      });
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.sports(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAdminSport(
  options?: UseMutationOptions<SuccessResponse, Error, string>,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (id) => api.deleteSport(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.sports(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminRefsList(
  type: RefType,
  options?: Omit<
    UseQueryOptions<AdminRefListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.refList(type),
    queryFn: () => api.listRefs(type),
    ...options,
  });
}

export function useAdminRef(
  type: RefType,
  id: string,
  options?: Omit<UseQueryOptions<RefItem, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminBasicsApi();
  return useQuery({
    queryKey: adminBasicsKeys.refDetail(type, id),
    queryFn: () => api.getRef(type, id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAdminRef(
  options?: UseMutationOptions<
    RefItem,
    Error,
    { type: RefType; input: AdminCreateRefItemInput }
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ type, input }) => api.createRef(type, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.refList(vars.type),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminRef(
  options?: UseMutationOptions<
    RefItem,
    Error,
    { type: RefType; id: string; input: AdminUpdateRefItemInput }
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ type, id, input }) => api.updateRef(type, id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.refDetail(vars.type, vars.id),
      });
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.refList(vars.type),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAdminRef(
  options?: UseMutationOptions<
    SuccessResponse,
    Error,
    { type: RefType; id: string }
  >,
) {
  const api = useAdminBasicsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ type, id }) => api.deleteRef(type, id),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminBasicsKeys.refList(vars.type),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
