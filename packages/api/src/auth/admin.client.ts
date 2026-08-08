import type { ApiClient } from "../client";
import type { AuthSession, PublicUser, TokenPair } from "../types";
import type {
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  OtpRequested,
  RequestOtpInput,
  ResetPasswordInput,
} from "./account.dto";
import type { AdminConfirmOtpInput } from "./admin.dto";
import { authAdminEndpoints as ep } from "./admin.endpoint";

/** Admin ops auth — Vite admin app (`/admin/account/auth`). */
export function createAdminAuthApi(client: ApiClient) {
  client.configureRefresh(ep.refresh);

  return {
    requestOtp(input: RequestOtpInput) {
      return client.request<OtpRequested>(ep.otp, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    async confirmOtp(input: AdminConfirmOtpInput) {
      const session = await client.request<AuthSession>(ep.otpConfirm, {
        method: "POST",
        public: true,
        body: input,
      });
      client.setSession(session);
      return session;
    },

    async login(input: LoginInput) {
      const session = await client.request<AuthSession>(ep.login, {
        method: "POST",
        public: true,
        body: input,
      });
      client.setSession(session);
      return session;
    },

    async refresh(refreshToken: string) {
      const pair = await client.request<TokenPair>(ep.refresh, {
        method: "POST",
        public: true,
        body: { refreshToken },
      });
      const current = client.getSession();
      if (current) {
        client.setSession({ ...current, ...pair });
      }
      return pair;
    },

    async logout(input: LogoutInput = {}) {
      try {
        await client.request<{ ok: true }>(ep.logout, {
          method: "POST",
          body: {
            refreshToken:
              input.refreshToken ?? client.getSession()?.refreshToken,
            all: input.all,
          },
        });
      } finally {
        client.setSession(null);
      }
    },

    forgotPassword(input: ForgotPasswordInput) {
      return client.request<OtpRequested>(ep.forgotPassword, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    forgotPasswordConfirm(input: ForgotPasswordConfirmInput) {
      return client.request<{ resetToken: string }>(ep.forgotPasswordConfirm, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    async resetPassword(input: ResetPasswordInput) {
      return client.request<{ success: true }>(ep.forgotPasswordReset, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    getSession() {
      return client.getSession();
    },

    getUser(): PublicUser | null {
      return client.getSession()?.user ?? null;
    },
  };
}

export type AdminAuthApi = ReturnType<typeof createAdminAuthApi>;
