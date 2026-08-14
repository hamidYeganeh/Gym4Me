"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, OtpRequested, PublicUser, Role } from "@repo/api";
import { ApiError } from "@repo/api";
import {
  clearBiometricUnlock,
  saveBiometricUnlock,
  readBiometricUnlock,
} from "@/modules/auth/lib/biometric-unlock";
import { captureSessionAttribution } from "@/shared/lib/attribution";
import { accountAuth, apiClient } from "@/shared/lib/api";

type AuthContextValue = {
  session: AuthSession | null;
  user: PublicUser | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  /** False until localStorage session is read on the client (SSR-safe). */
  isReady: boolean;
  login: (phone: string, password: string) => Promise<AuthSession>;
  requestOtp: (phone: string) => Promise<OtpRequested>;
  loginWithOtp: (
    phone: string,
    code: string,
    extras?: { firstName?: string; lastName?: string; referralCode?: string },
  ) => Promise<AuthSession>;
  /** Restore a previously saved session after device biometric success. */
  loginWithBiometricUnlock: () => Promise<AuthSession>;
  switchRole: (role: Role) => Promise<AuthSession>;
  refreshUser: (user: PublicUser) => void;
  /**
   * Local lock by default (keeps refresh for biometric unlock).
   * Pass `{ revoke: true }` for a hard sign-out that clears biometric unlock.
   */
  logout: (options?: { revoke?: boolean }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function rememberSession(session: AuthSession) {
  saveBiometricUnlock(session);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start null so SSR HTML matches the first client render.
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(accountAuth.getSession());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !session?.accessToken) return;
    rememberSession(session);
    void captureSessionAttribution();
  }, [isReady, session]);

  const login = useCallback(async (phone: string, password: string) => {
    const next = await accountAuth.login({ phone, password });
    rememberSession(next);
    setSession(next);
    void captureSessionAttribution();
    return next;
  }, []);

  const requestOtp = useCallback(
    (phone: string) => accountAuth.requestOtp({ phone }),
    [],
  );

  const loginWithOtp = useCallback(
    async (
      phone: string,
      code: string,
      extras?: { firstName?: string; lastName?: string; referralCode?: string },
    ) => {
      const next = await accountAuth.confirmOtp({
        phone,
        code,
        firstName: extras?.firstName,
        lastName: extras?.lastName,
        referralCode: extras?.referralCode,
      });
      rememberSession(next);
      setSession(next);
      void captureSessionAttribution();
      return next;
    },
    [],
  );

  const loginWithBiometricUnlock = useCallback(async () => {
    const unlock = readBiometricUnlock();
    if (!unlock?.refreshToken) {
      throw new ApiError(
        401,
        { message: "Biometric unlock unavailable" },
        "Biometric unlock unavailable",
      );
    }

    // Seed storage so refresh can merge the new token pair onto the session.
    apiClient.setSession(unlock);
    try {
      const pair = await accountAuth.refresh(unlock.refreshToken);
      const next: AuthSession = {
        ...unlock,
        ...pair,
      };
      apiClient.setSession(next);
      rememberSession(next);
      setSession(next);
      void captureSessionAttribution();
      return next;
    } catch (error) {
      clearBiometricUnlock();
      apiClient.setSession(null);
      setSession(null);
      throw error;
    }
  }, []);

  const switchRole = useCallback(async (role: Role) => {
    const next = await accountAuth.switchRole({ role });
    rememberSession(next);
    setSession(next);
    return next;
  }, []);

  const refreshUser = useCallback((user: PublicUser) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user };
      apiClient.setSession(next);
      rememberSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(async (options?: { revoke?: boolean }) => {
    const revoke = options?.revoke ?? false;
    const current = accountAuth.getSession() ?? session;

    // Keep a snapshot for Face ID unlock unless this is a hard revoke.
    if (current && !revoke) {
      rememberSession(current);
    }

    // Revoke the push device token while the access token is still valid.
    const { revokeCurrentDeviceToken } = await import("@/shared/lib/push");
    await revokeCurrentDeviceToken();

    // Never leak offline metric queue across accounts.
    const { clearOfflineQueue } = await import("@/shared/lib/offline-queue");
    await clearOfflineQueue();

    if (revoke) {
      try {
        await accountAuth.logout();
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          throw error;
        }
      } finally {
        clearBiometricUnlock();
        setSession(null);
      }
      return;
    }

    // Soft lock: clear active session locally, keep biometric unlock payload.
    apiClient.setSession(null);
    setSession(null);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      activeRole: session?.activeRole ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isReady,
      login,
      requestOtp,
      loginWithOtp,
      loginWithBiometricUnlock,
      switchRole,
      refreshUser,
      logout,
    }),
    [
      session,
      isReady,
      login,
      requestOtp,
      loginWithOtp,
      loginWithBiometricUnlock,
      switchRole,
      refreshUser,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
