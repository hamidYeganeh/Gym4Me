import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminClubSlotsApi,
  type AdminClubSlotsApi,
} from "./club-slots.client";
import type {
  CancelSlotOccurrenceInput,
  ClubClass,
  ClubClassesList,
  ClubSlot,
  ClubSlotsList,
  CreateClubClassInput,
  CreateClubSlotInput,
  UpdateClubClassInput,
  UpdateClubSlotInput,
} from "./club-slots.dto";
import { adminClubSlotsKeys } from "./club-slots.keys";

function useAdminClubSlotsApi(): AdminClubSlotsApi {
  const client = useApiClient();
  return useMemo(() => createAdminClubSlotsApi(client), [client]);
}

export function useAdminClubClasses(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ClubClassesList, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminClubSlotsApi();
  return useQuery({
    queryKey: adminClubSlotsKeys.classes(clubId),
    queryFn: () => api.listClasses(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAdminClubSlots(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ClubSlotsList, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminClubSlotsApi();
  return useQuery({
    queryKey: adminClubSlotsKeys.slots(clubId),
    queryFn: () => api.listSlots(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAdminClubClass(
  options?: UseMutationOptions<
    ClubClass,
    Error,
    { clubId: string; input: CreateClubClassInput }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.createClass(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.classes(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminClubClass(
  options?: UseMutationOptions<
    ClubClass,
    Error,
    { clubId: string; classId: string; input: UpdateClubClassInput }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, classId, input }) =>
      api.updateClass(clubId, classId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.classes(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useArchiveAdminClubClass(
  options?: UseMutationOptions<
    ClubClass,
    Error,
    { clubId: string; classId: string }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, classId }) => api.archiveClass(clubId, classId),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.classes(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useCreateAdminClubSlot(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; input: CreateClubSlotInput }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.createSlot(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminClubSlot(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; slotId: string; input: UpdateClubSlotInput }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, slotId, input }) =>
      api.updateSlot(clubId, slotId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useArchiveAdminClubSlot(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; slotId: string }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, slotId }) => api.archiveSlot(clubId, slotId),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useCancelAdminSlotOccurrence(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; slotId: string; input: CancelSlotOccurrenceInput }
  >,
) {
  const api = useAdminClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, slotId, input }) =>
      api.cancelOccurrence(clubId, slotId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
