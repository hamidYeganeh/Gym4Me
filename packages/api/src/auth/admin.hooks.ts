import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { AuthSession, TokenPair } from "../types";
import type {
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  OtpRequested,
  RequestOtpInput,
  ResetPasswordInput,
} from "./account.dto";
import { createAdminAuthApi, type AdminAuthApi } from "./admin.client";
import type { AdminConfirmOtpInput } from "./admin.dto";
import { authAdminKeys } from "./admin.keys";

function useAdminAuthApi(): AdminAuthApi {
  const client = useApiClient();
  return useMemo(() => createAdminAuthApi(client), [client]);
}

export function useAdminAuthSession(
  options?: Omit<
    UseQueryOptions<AuthSession | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminAuthApi();
  return useQuery({
    queryKey: authAdminKeys.session(),
    queryFn: () => api.getSession(),
    ...options,
  });
}

export function useAdminRequestOtp(
  options?: UseMutationOptions<OtpRequested, Error, RequestOtpInput>,
) {
  const api = useAdminAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.requestOtp(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminConfirmOtp(
  options?: UseMutationOptions<AuthSession, Error, AdminConfirmOtpInput>,
) {
  const api = useAdminAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.confirmOtp(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAdminKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminLogin(
  options?: UseMutationOptions<AuthSession, Error, LoginInput>,
) {
  const api = useAdminAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.login(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAdminKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminRefresh(
  options?: UseMutationOptions<TokenPair, Error, string>,
) {
  const api = useAdminAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (refreshToken) => api.refresh(refreshToken),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAdminKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminLogout(
  options?: UseMutationOptions<void, Error, LogoutInput | undefined>,
) {
  const api = useAdminAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.logout(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAdminKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminForgotPassword(
  options?: UseMutationOptions<OtpRequested, Error, ForgotPasswordInput>,
) {
  const api = useAdminAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.forgotPassword(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminForgotPasswordConfirm(
  options?: UseMutationOptions<
    { resetToken: string },
    Error,
    ForgotPasswordConfirmInput
  >,
) {
  const api = useAdminAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.forgotPasswordConfirm(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminResetPassword(
  options?: UseMutationOptions<{ success: true }, Error, ResetPasswordInput>,
) {
  const api = useAdminAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.resetPassword(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
