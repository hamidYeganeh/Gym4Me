import type { ApiClient } from "../client";
import type { AuthSession, PublicUser, TokenPair } from "../types";
import type {
  ConfirmOtpInput,
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  OtpRequested,
  RequestOtpInput,
  ResetPasswordInput,
} from "./account";

export type AdminConfirmOtpInput = Pick<ConfirmOtpInput, "phone" | "code">;

/** Admin ops auth — Vite admin app (`/admin/account/auth`). */
export function createAdminAuthApi(client: ApiClient) {
  client.configureRefresh("/admin/account/auth/refresh");

  return {
    requestOtp(input: RequestOtpInput) {
      return client.request<OtpRequested>("/admin/account/auth/otp", {
        method: "POST",
        public: true,
        body: input,
      });
    },

    async confirmOtp(input: AdminConfirmOtpInput) {
      const session = await client.request<AuthSession>(
        "/admin/account/auth/otp/confirm",
        {
          method: "POST",
          public: true,
          body: input,
        },
      );
      client.setSession(session);
      return session;
    },

    async login(input: LoginInput) {
      const session = await client.request<AuthSession>(
        "/admin/account/auth/login",
        {
          method: "POST",
          public: true,
          body: input,
        },
      );
      client.setSession(session);
      return session;
    },

    async refresh(refreshToken: string) {
      const pair = await client.request<TokenPair>(
        "/admin/account/auth/refresh",
        {
          method: "POST",
          public: true,
          body: { refreshToken },
        },
      );
      const current = client.getSession();
      if (current) {
        client.setSession({ ...current, ...pair });
      }
      return pair;
    },

    async logout(input: LogoutInput = {}) {
      try {
        await client.request<{ ok: true }>("/admin/account/auth/logout", {
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
      return client.request<OtpRequested>(
        "/admin/account/auth/forgot-password",
        {
          method: "POST",
          public: true,
          body: input,
        },
      );
    },

    forgotPasswordConfirm(input: ForgotPasswordConfirmInput) {
      return client.request<{ resetToken: string }>(
        "/admin/account/auth/forgot-password/confirm",
        {
          method: "POST",
          public: true,
          body: input,
        },
      );
    },

    async resetPassword(input: ResetPasswordInput) {
      const session = await client.request<AuthSession>(
        "/admin/account/auth/forgot-password/reset",
        {
          method: "POST",
          public: true,
          body: input,
        },
      );
      client.setSession(session);
      return session;
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
