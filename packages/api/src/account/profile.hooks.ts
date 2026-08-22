import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { FavouriteLocation, PublicUser } from "../types";
import {
  createAccountProfileApi,
  type AccountProfileApi,
} from "./profile.client";
import type {
  AthleteProfile,
  CoachProfile,
  CreateFavouriteLocationInput,
  FavouriteLocationsList,
  ProfileSettings,
  SubmitCoachVerificationInput,
  UpdateAthleteProfileInput,
  UpdateCoachProfileInput,
  UpdateFavouriteLocationInput,
  UpdateMeInput,
  UpdateProfileSettingsInput,
} from "./profile.dto";
import { accountProfileKeys } from "./profile.keys";

function useAccountProfileApi(): AccountProfileApi {
  const client = useApiClient();
  return useMemo(() => createAccountProfileApi(client), [client]);
}

export function useAccountProfileMe(
  options?: Omit<UseQueryOptions<PublicUser, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountProfileApi();
  return useQuery({
    queryKey: accountProfileKeys.me(),
    queryFn: () => api.getMe(),
    ...options,
  });
}

export function useUpdateAccountProfileMe(
  options?: UseMutationOptions<PublicUser, Error, UpdateMeInput>,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.updateMe(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: accountProfileKeys.me() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountProfileSettings(
  options?: Omit<
    UseQueryOptions<ProfileSettings, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProfileApi();
  return useQuery({
    queryKey: accountProfileKeys.settings(),
    queryFn: () => api.getSettings(),
    ...options,
  });
}

export function useUpdateAccountProfileSettings(
  options?: UseMutationOptions<
    ProfileSettings,
    Error,
    UpdateProfileSettingsInput
  >,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.updateSettings(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountProfileKeys.settings(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountAthleteProfile(
  options?: Omit<
    UseQueryOptions<AthleteProfile, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProfileApi();
  return useQuery({
    queryKey: accountProfileKeys.athlete(),
    queryFn: () => api.getAthlete(),
    ...options,
  });
}

export function useUpdateAccountAthleteProfile(
  options?: UseMutationOptions<AthleteProfile, Error, UpdateAthleteProfileInput>,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.updateAthlete(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountProfileKeys.athlete(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountCoachProfile(
  options?: Omit<UseQueryOptions<CoachProfile, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountProfileApi();
  return useQuery({
    queryKey: accountProfileKeys.coach(),
    queryFn: () => api.getCoach(),
    ...options,
  });
}

export function useUpdateAccountCoachProfile(
  options?: UseMutationOptions<CoachProfile, Error, UpdateCoachProfileInput>,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.updateCoach(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountProfileKeys.coach(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useSubmitCoachVerification(
  options?: UseMutationOptions<
    CoachProfile,
    Error,
    SubmitCoachVerificationInput
  >,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.submitCoachVerification(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountProfileKeys.coach(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

function invalidateFavouriteLocations(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({
    queryKey: accountProfileKeys.locations(),
  });
  void queryClient.invalidateQueries({ queryKey: accountProfileKeys.me() });
}

export function useAccountFavouriteLocations(
  options?: Omit<
    UseQueryOptions<FavouriteLocationsList, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProfileApi();
  return useQuery({
    queryKey: accountProfileKeys.locations(),
    queryFn: () => api.listFavouriteLocations(),
    ...options,
  });
}

export function useCreateAccountFavouriteLocation(
  options?: UseMutationOptions<
    FavouriteLocation,
    Error,
    CreateFavouriteLocationInput
  >,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createFavouriteLocation(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidateFavouriteLocations(queryClient);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAccountFavouriteLocation(
  options?: UseMutationOptions<
    FavouriteLocation,
    Error,
    { id: string; input: UpdateFavouriteLocationInput }
  >,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updateFavouriteLocation(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidateFavouriteLocations(queryClient);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAccountFavouriteLocation(
  options?: UseMutationOptions<FavouriteLocationsList, Error, string>,
) {
  const api = useAccountProfileApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (id) => api.deleteFavouriteLocation(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidateFavouriteLocations(queryClient);
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
