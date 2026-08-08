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
  switchRole: (role: Role) => Promise<AuthSession>;
  refreshUser: (user: PublicUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    void captureSessionAttribution();
  }, [isReady, session?.accessToken]);

  const login = useCallback(async (phone: string, password: string) => {
    const next = await accountAuth.login({ phone, password });
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
      setSession(next);
      void captureSessionAttribution();
      return next;
    },
    [],
  );

  const switchRole = useCallback(async (role: Role) => {
    const next = await accountAuth.switchRole({ role });
    setSession(next);
    return next;
  }, []);

  const refreshUser = useCallback((user: PublicUser) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user };
      apiClient.setSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    // Revoke the push device token while the access token is still valid.
    const { revokeCurrentDeviceToken } = await import("@/shared/lib/push");
    await revokeCurrentDeviceToken();
    try {
      await accountAuth.logout();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        throw error;
      }
    } finally {
      setSession(null);
    }
  }, []);

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
