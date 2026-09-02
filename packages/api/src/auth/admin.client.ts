import type { ApiClient } from "../client";
import type { PublicUser, TokenPair } from "../types";
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
import { createLegacySession, legacyTokenPair } from "./session-adapter";
import { ApiError } from "../errors";

function asOtpRequested(data: any): OtpRequested {
  return {
    expiresInSeconds: Number(data?.expiresInSeconds ?? data?.expires_in ?? 120),
    ...(data?.debugCode || data?.debug_code
      ? { debugCode: String(data.debugCode ?? data.debug_code) }
      : {}),
  };
}

async function requireAdmin(client: ApiClient, session: Awaited<ReturnType<typeof createLegacySession>>) {
  if (session.user.roles.includes("admin")) return session;
  await client.setSession(null);
  throw new ApiError(
    403,
    { code: "ADMIN_ACCESS_REQUIRED", message: "این حساب دسترسی مدیریت ندارد." },
    "Admin access is required.",
  );
}

/** Admin ops auth — Vite admin app (`/admin/account/auth`). */
export function createAdminAuthApi(client: ApiClient) {
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

    async confirmOtp(input: AdminConfirmOtpInput) {
      const result = await client.request<any>(ep.otpConfirm, {
        method: "POST",
        public: true,
        body: { mobile: input.phone, code: input.code, purpose: "LOGIN" },
      });
      const session = await requireAdmin(
        client,
        await createLegacySession(client, result, "admin"),
      );
      await client.setSession(session);
      return session;
    },

    async login(input: LoginInput) {
      const result = await client.request<any>(ep.login, {
        method: "POST",
        public: true,
        body: { mobile: input.phone, password: input.password },
      });
      const session = await requireAdmin(
        client,
        await createLegacySession(client, result, "admin"),
      );
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
      return { resetToken: String(result.resetToken ?? result.reset_token ?? "") };
    },

    async resetPassword(input: ResetPasswordInput) {
      await client.request(ep.forgotPasswordReset, {
        method: "POST",
        public: true,
        body: { reset_token: input.resetToken, new_password: input.password },
      });
      await client.setSession(null);
      return { success: true as const };
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
