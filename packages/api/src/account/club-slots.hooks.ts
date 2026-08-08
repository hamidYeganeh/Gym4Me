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
  createClubOwnerClubSlotsApi,
  type ClubOwnerClubSlotsApi,
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
import { accountClubSlotsKeys } from "./club-slots.keys";

function useClubOwnerClubSlotsApi(): ClubOwnerClubSlotsApi {
  const client = useApiClient();
  return useMemo(() => createClubOwnerClubSlotsApi(client), [client]);
}

export function useAccountClubClasses(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ClubClassesList, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  return useQuery({
    queryKey: accountClubSlotsKeys.classes(clubId),
    queryFn: () => api.listClasses(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAccountClubSlots(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ClubSlotsList, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  return useQuery({
    queryKey: accountClubSlotsKeys.slots(clubId),
    queryFn: () => api.listSlots(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAccountClubClass(
  options?: UseMutationOptions<
    ClubClass,
    Error,
    { clubId: string; input: CreateClubClassInput }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.createClass(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.classes(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAccountClubClass(
  options?: UseMutationOptions<
    ClubClass,
    Error,
    { clubId: string; classId: string; input: UpdateClubClassInput }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, classId, input }) =>
      api.updateClass(clubId, classId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.classes(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useArchiveAccountClubClass(
  options?: UseMutationOptions<
    ClubClass,
    Error,
    { clubId: string; classId: string }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, classId }) => api.archiveClass(clubId, classId),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.classes(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useCreateAccountClubSlot(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; input: CreateClubSlotInput }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.createSlot(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAccountClubSlot(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; slotId: string; input: UpdateClubSlotInput }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, slotId, input }) =>
      api.updateSlot(clubId, slotId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useArchiveAccountClubSlot(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; slotId: string }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, slotId }) => api.archiveSlot(clubId, slotId),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useCancelAccountSlotOccurrence(
  options?: UseMutationOptions<
    ClubSlot,
    Error,
    { clubId: string; slotId: string; input: CancelSlotOccurrenceInput }
  >,
) {
  const api = useClubOwnerClubSlotsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, slotId, input }) =>
      api.cancelOccurrence(clubId, slotId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubSlotsKeys.slots(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
