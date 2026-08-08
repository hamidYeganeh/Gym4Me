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
import {
  createAccountAuthApi,
  type AccountAuthApi,
} from "./account.client";
import type {
  ConfirmOtpInput,
  ForgotPasswordConfirmInput,
  ForgotPasswordConfirmed,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  OtpRequested,
  RequestOtpInput,
  ResetPasswordInput,
  SetPasswordInput,
  SwitchRoleInput,
} from "./account.dto";
import { authAccountKeys } from "./account.keys";

function useAccountAuthApi(): AccountAuthApi {
  const client = useApiClient();
  return useMemo(() => createAccountAuthApi(client), [client]);
}

export function useAccountAuthSession(
  options?: Omit<
    UseQueryOptions<AuthSession | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountAuthApi();
  return useQuery({
    queryKey: authAccountKeys.session(),
    queryFn: () => api.getSession(),
    ...options,
  });
}

export function useAccountRequestOtp(
  options?: UseMutationOptions<OtpRequested, Error, RequestOtpInput>,
) {
  const api = useAccountAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.requestOtp(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountConfirmOtp(
  options?: UseMutationOptions<AuthSession, Error, ConfirmOtpInput>,
) {
  const api = useAccountAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.confirmOtp(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAccountKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountLogin(
  options?: UseMutationOptions<AuthSession, Error, LoginInput>,
) {
  const api = useAccountAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.login(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAccountKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountRefresh(
  options?: UseMutationOptions<TokenPair, Error, string>,
) {
  const api = useAccountAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (refreshToken) => api.refresh(refreshToken),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAccountKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountSwitchRole(
  options?: UseMutationOptions<AuthSession, Error, SwitchRoleInput>,
) {
  const api = useAccountAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.switchRole(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAccountKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountLogout(
  options?: UseMutationOptions<void, Error, LogoutInput | undefined>,
) {
  const api = useAccountAuthApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.logout(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: authAccountKeys.session(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountForgotPassword(
  options?: UseMutationOptions<OtpRequested, Error, ForgotPasswordInput>,
) {
  const api = useAccountAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.forgotPassword(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountForgotPasswordConfirm(
  options?: UseMutationOptions<
    ForgotPasswordConfirmed,
    Error,
    ForgotPasswordConfirmInput
  >,
) {
  const api = useAccountAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.forgotPasswordConfirm(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountResetPassword(
  options?: UseMutationOptions<AuthSession, Error, ResetPasswordInput>,
) {
  const api = useAccountAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.resetPassword(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAccountSetPassword(
  options?: UseMutationOptions<{ ok: true }, Error, SetPasswordInput>,
) {
  const api = useAccountAuthApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.setPassword(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
