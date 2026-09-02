import type { TokenPair } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type {
  AccessContextResult,
  ActivateAccessContextInput,
  ActivatedAccessContext,
  AuthResult,
  AuthSession,
  OtpChallenge,
  OtpRequestInput,
  OtpVerifyInput,
  PasswordLoginInput,
  PasswordRecoveryResetInput,
  PasswordRecoveryVerifyInput,
  ProfilePatch,
  ProfileResult,
} from "./types";

export const accountApi = {
  async requestOtp(client: ApiClient, input: OtpRequestInput): Promise<OtpChallenge> {
    return (await client.post<OtpChallenge, OtpRequestInput>("/account/auth/otp/request", input))
      .data;
  },

  async verifyOtp(client: ApiClient, input: OtpVerifyInput): Promise<AuthResult> {
    return (await client.post<AuthResult, OtpVerifyInput>("/account/auth/otp/verify", input)).data;
  },

  async passwordLogin(client: ApiClient, input: PasswordLoginInput): Promise<AuthResult> {
    return (
      await client.post<AuthResult, PasswordLoginInput>("/account/auth/password/login", input)
    ).data;
  },

  async refreshToken(client: ApiClient, refreshToken: string): Promise<TokenPair> {
    return (
      await client.post<TokenPair, { refresh_token: string }>("/account/auth/token/refresh", {
        refresh_token: refreshToken,
      })
    ).data;
  },

  async requestPasswordRecovery(client: ApiClient, mobile: string): Promise<{ accepted: true }> {
    return (
      await client.post<{ accepted: true }, { mobile: string }>(
        "/account/auth/password/recovery/request",
        { mobile },
      )
    ).data;
  },

  async verifyPasswordRecovery(
    client: ApiClient,
    input: PasswordRecoveryVerifyInput,
  ): Promise<{ reset_token: string; expires_in: number }> {
    return (
      await client.post<{ reset_token: string; expires_in: number }, PasswordRecoveryVerifyInput>(
        "/account/auth/password/recovery/verify",
        input,
      )
    ).data;
  },

  async resetPassword(
    client: ApiClient,
    input: PasswordRecoveryResetInput,
  ): Promise<{ reset: true }> {
    return (
      await client.post<{ reset: true }, PasswordRecoveryResetInput>(
        "/account/auth/password/recovery/reset",
        input,
      )
    ).data;
  },

  async logout(client: ApiClient): Promise<{ logged_out: true }> {
    return (await client.post<{ logged_out: true }>("/account/auth/logout")).data;
  },

  async logoutAll(client: ApiClient): Promise<{ logged_out: true }> {
    return (await client.post<{ logged_out: true }>("/account/auth/logout-all")).data;
  },

  async getProfile(client: ApiClient, signal?: AbortSignal): Promise<ProfileResult> {
    return (await client.get<ProfileResult>("/account/profile/me", signal ? { signal } : undefined))
      .data;
  },

  async updateProfile(client: ApiClient, input: ProfilePatch): Promise<ProfileResult> {
    return (await client.patch<ProfileResult, ProfilePatch>("/account/profile/me", input)).data;
  },

  async setPassword(client: ApiClient, newPassword: string): Promise<{ password_set: true }> {
    return (
      await client.post<{ password_set: true }, { new_password: string }>(
        "/account/security/password/set",
        { new_password: newPassword },
      )
    ).data;
  },

  async changePassword(
    client: ApiClient,
    input: { current_password: string; new_password: string },
  ): Promise<{ password_changed: true }> {
    return (
      await client.post<{ password_changed: true }, typeof input>(
        "/account/security/password/change",
        input,
      )
    ).data;
  },

  async sessions(client: ApiClient, signal?: AbortSignal): Promise<AuthSession[]> {
    return (
      await client.get<AuthSession[]>("/account/security/sessions", signal ? { signal } : undefined)
    ).data;
  },

  async revokeSession(
    client: ApiClient,
    sessionId: string,
  ): Promise<{ revoked: true; current: boolean }> {
    return (
      await client.delete<{ revoked: true; current: boolean }>(
        `/account/security/sessions/${encodeURIComponent(sessionId)}`,
      )
    ).data;
  },

  async getAccessContext(client: ApiClient, signal?: AbortSignal): Promise<AccessContextResult> {
    return (
      await client.get<AccessContextResult>(
        "/account/access-context",
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async activateAccessContext(
    client: ApiClient,
    input: ActivateAccessContextInput,
  ): Promise<ActivatedAccessContext> {
    return (
      await client.post<ActivatedAccessContext, ActivateAccessContextInput>(
        "/account/access-context/activate",
        input,
      )
    ).data;
  },
};
