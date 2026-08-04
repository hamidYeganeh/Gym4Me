import type { ApiClient } from "../client";
import type { AuthSession, PublicUser, Role, TokenPair } from "../types";

export type LoginInput = {
  phone: string;
  password: string;
};

export type RequestOtpInput = {
  phone: string;
};

export type ConfirmOtpInput = {
  phone: string;
  code: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
};

export type SwitchRoleInput = {
  role: Role;
  refreshToken?: string;
};

export type LogoutInput = {
  refreshToken?: string;
  all?: boolean;
};

export type ForgotPasswordInput = {
  phone: string;
};

export type ForgotPasswordConfirmInput = {
  phone: string;
  code: string;
};

export type ResetPasswordInput = {
  resetToken: string;
  password: string;
};

export type SetPasswordInput = {
  password: string;
  currentPassword?: string;
};

export type OtpRequested = {
  expiresInSeconds: number;
  debugCode?: string;
};

export type ForgotPasswordConfirmed = {
  resetToken: string;
};

function asSession(data: AuthSession): AuthSession {
  return data;
}

/** Account auth — mobile / multi-role app (`/account/auth`). */
export function createAccountAuthApi(client: ApiClient) {
  client.configureRefresh("/account/auth/refresh");

  return {
    requestOtp(input: RequestOtpInput) {
      return client.request<OtpRequested>("/account/auth/otp", {
        method: "POST",
        public: true,
        body: input,
      });
    },

    async confirmOtp(input: ConfirmOtpInput) {
      const session = asSession(
        await client.request<AuthSession>("/account/auth/otp/confirm", {
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
        await client.request<AuthSession>("/account/auth/login", {
          method: "POST",
          public: true,
          body: input,
        }),
      );
      client.setSession(session);
      return session;
    },

    async refresh(refreshToken: string) {
      const pair = await client.request<TokenPair>("/account/auth/refresh", {
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
        await client.request<AuthSession>("/account/auth/switch-role", {
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
        await client.request<{ ok: true }>("/account/auth/logout", {
          method: "POST",
          body: {
            refreshToken: input.refreshToken ?? client.getSession()?.refreshToken,
            all: input.all,
          },
        });
      } finally {
        client.setSession(null);
      }
    },

    forgotPassword(input: ForgotPasswordInput) {
      return client.request<OtpRequested>("/account/auth/forgot-password", {
        method: "POST",
        public: true,
        body: input,
      });
    },

    forgotPasswordConfirm(input: ForgotPasswordConfirmInput) {
      return client.request<ForgotPasswordConfirmed>(
        "/account/auth/forgot-password/confirm",
        {
          method: "POST",
          public: true,
          body: input,
        },
      );
    },

    resetPassword(input: ResetPasswordInput) {
      return client.request<AuthSession>("/account/auth/forgot-password/reset", {
        method: "POST",
        public: true,
        body: input,
      });
    },

    setPassword(input: SetPasswordInput) {
      return client.request<{ ok: true }>("/account/auth/set-password", {
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
