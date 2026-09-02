"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { accountApi } from "./api";
import { accountKeys } from "./queries";

export function useRequestOtpMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.requestOtp>[1]) =>
      accountApi.requestOtp(client, input),
  });
}

export function useVerifyOtpMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.verifyOtp>[1]) =>
      accountApi.verifyOtp(client, input),
  });
}

export function usePasswordLoginMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.passwordLogin>[1]) =>
      accountApi.passwordLogin(client, input),
  });
}

export function useRefreshTokenMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (refreshToken: string) => accountApi.refreshToken(client, refreshToken),
  });
}

export function useRequestPasswordRecoveryMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (mobile: string) => accountApi.requestPasswordRecovery(client, mobile),
  });
}

export function useVerifyPasswordRecoveryMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.verifyPasswordRecovery>[1]) =>
      accountApi.verifyPasswordRecovery(client, input),
  });
}

export function useResetPasswordMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.resetPassword>[1]) =>
      accountApi.resetPassword(client, input),
  });
}

export function useSetPasswordMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (newPassword: string) => accountApi.setPassword(client, newPassword),
  });
}

export function useChangePasswordMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.changePassword>[1]) =>
      accountApi.changePassword(client, input),
  });
}

export function useRevokeSessionMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => accountApi.revokeSession(client, sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.sessions() }),
  });
}

export function useUpdateProfileMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.updateProfile>[1]) =>
      accountApi.updateProfile(client, input),
    onSuccess: (profile) => queryClient.setQueryData(accountKeys.profile(), profile),
  });
}

export function useActivateAccessContextMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof accountApi.activateAccessContext>[1]) =>
      accountApi.activateAccessContext(client, input),
    onSuccess: async (result) => {
      client.setAccessToken(result.access_token);
      await queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useLogoutMutation(allSessions = false) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => (allSessions ? accountApi.logoutAll(client) : accountApi.logout(client)),
    onSuccess: () => {
      client.setAccessToken(null);
      queryClient.removeQueries({ queryKey: accountKeys.all });
    },
  });
}
