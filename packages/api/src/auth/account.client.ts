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

function asSession(data: AuthSession): AuthSession {
  return data;
}

/** Account auth — mobile / multi-role app (`/account/auth`). */
export function createAccountAuthApi(client: ApiClient) {
  client.configureRefresh(ep.refresh);

  return {
    requestOtp(input: RequestOtpInput) {
      return client.request<OtpRequested>(ep.otp, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    async confirmOtp(input: ConfirmOtpInput) {
      const session = asSession(
        await client.request<AuthSession>(ep.otpConfirm, {
          method: "POST",
          public: true,
          body: input,
        }),
      );
      client.setSession(session);
      return session;
    },

    async login(input: LoginInput) {
      const session = asSession(
        await client.request<AuthSession>(ep.login, {
          method: "POST",
          public: true,
          body: input,
        }),
      );
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

    async switchRole(input: SwitchRoleInput) {
      const session = asSession(
        await client.request<AuthSession>(ep.switchRole, {
          method: "POST",
          body: {
            role: input.role,
            refreshToken:
              input.refreshToken ?? client.getSession()?.refreshToken,
          },
        }),
      );
      client.setSession(session);
      return session;
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
      return client.request<ForgotPasswordConfirmed>(ep.forgotPasswordConfirm, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    resetPassword(input: ResetPasswordInput) {
      return client.request<AuthSession>(ep.forgotPasswordReset, {
        method: "POST",
        public: true,
        body: input,
      });
    },

    setPassword(input: SetPasswordInput) {
      return client.request<{ ok: true }>(ep.setPassword, {
        method: "POST",
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

export type AccountAuthApi = ReturnType<typeof createAccountAuthApi>;
