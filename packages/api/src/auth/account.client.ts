import type { ApiClient } from "../client";
import type { AuthSession, PublicUser, TokenPair } from "../types";
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
import { authAccountEndpoints as ep } from "./account.endpoint";
import { createLegacySession, legacyTokenPair } from "./session-adapter";

function asSession(data: AuthSession): AuthSession {
  return data;
}

function asOtpRequested(data: any): OtpRequested {
  return {
    expiresInSeconds: Number(data?.expiresInSeconds ?? data?.expires_in ?? 120),
    ...(data?.debugCode || data?.debug_code
      ? { debugCode: String(data.debugCode ?? data.debug_code) }
      : {}),
  };
}

/** Account auth — mobile / multi-role app (`/account/auth`). */
export function createAccountAuthApi(client: ApiClient) {
  client.configureRefresh(ep.refresh);

  return {
    async requestOtp(input: RequestOtpInput) {
      const result = await client.request<any>(ep.otp, {
        method: "POST",
        public: true,
        body: { mobile: input.phone, purpose: "LOGIN" },
      });
      return asOtpRequested(result);
    },

    async confirmOtp(input: ConfirmOtpInput) {
      const result = await client.request<any>(ep.otpConfirm, {
          method: "POST",
          public: true,
          body: { mobile: input.phone, code: input.code, purpose: "LOGIN" },
        });
      const session = asSession(await createLegacySession(client, result, "athlete"));
      await client.setSession(session);
      return session;
    },

    async login(input: LoginInput) {
      const result = await client.request<any>(ep.login, {
          method: "POST",
          public: true,
          body: { mobile: input.phone, password: input.password },
        });
      const session = asSession(await createLegacySession(client, result));
      await client.setSession(session);
      return session;
    },

    async refresh(refreshToken: string) {
      const result = await client.request<any>(ep.refresh, {
        method: "POST",
        public: true,
        body: { refresh_token: refreshToken },
      });
      const pair: TokenPair = legacyTokenPair(result);
      const current = client.getSession();
      if (current) {
        await client.setSession({ ...current, ...pair });
      }
      return pair;
    },

    async switchRole(input: SwitchRoleInput) {
      const contexts = await client.request<any>("/account/access-context");
      const assignment = (contexts.assignments ?? []).find((item: any) => {
        const code = String(item.role_code ?? "");
        return code === input.role || (input.role === "admin" && code.includes("admin"));
      });
      if (!assignment) throw new Error(`No access context is available for role ${input.role}.`);
      const activated = await client.request<any>(ep.switchRole, {
        method: "POST",
        body: {
          role_id: assignment.role_id,
          scope_type: assignment.scope_type,
          ...(assignment.scope_id ? { scope_id: assignment.scope_id } : {}),
        },
      });
      const current = client.getSession();
      if (!current) throw new Error("Cannot switch role without an active session.");
      const session = asSession({
        ...current,
        accessToken: activated.access_token,
        activeRole: input.role,
      });
      await client.setSession(session);
      return session;
    },

    async logout(input: LogoutInput = {}) {
      try {
        await client.request<{ ok: true }>(input.all ? ep.logoutAll : ep.logout, {
          method: "POST",
        });
      } finally {
        await client.setSession(null);
      }
    },

    async forgotPassword(input: ForgotPasswordInput) {
      const result = await client.request<any>(ep.forgotPassword, {
        method: "POST",
        public: true,
        body: { mobile: input.phone },
      });
      return asOtpRequested(result);
    },

    async forgotPasswordConfirm(input: ForgotPasswordConfirmInput) {
      const result = await client.request<any>(ep.forgotPasswordConfirm, {
        method: "POST",
        public: true,
        body: { mobile: input.phone, code: input.code },
      });
      return { resetToken: String(result.resetToken ?? result.reset_token ?? "") } satisfies ForgotPasswordConfirmed;
    },

    async resetPassword(input: ResetPasswordInput): Promise<void> {
      await client.request(ep.forgotPasswordReset, {
        method: "POST",
        public: true,
        body: { reset_token: input.resetToken, new_password: input.password },
      });
      await client.setSession(null);
    },

    async setPassword(input: SetPasswordInput) {
      await client.request(ep.setPassword, {
        method: "POST",
        body: { new_password: input.password },
      });
      return { ok: true as const };
    },

    getSession() {
      return client.getSession();
    },

    getUser(): PublicUser | null {
      return client.getSession()?.user ?? null;
    },
  };
}

export type AccountAuthApi = ReturnType<typeof createAccountAuthApi>;
