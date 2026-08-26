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
import type { OtpRequested } from "@repo/api/auth";
import { ApiError } from "@repo/api/client";
import type { AuthSession, PublicUser, Role } from "@repo/api";
import {
  clearBiometricUnlock,
  saveBiometricUnlock,
  readBiometricUnlock,
} from "@/modules/auth/lib/biometric-unlock";
import {
  accountAuth,
  accountSessionStorage,
  apiClient,
  SESSION_INVALIDATED_EVENT,
} from "@/shared/lib/api-client";
import { accountProfile } from "@/shared/lib/api";

function captureSessionAttribution() {
  void import("@/shared/lib/attribution").then((mod) =>
    mod.captureSessionAttribution(),
  );
}

type AuthContextValue = {
  session: AuthSession | null;
  user: PublicUser | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  /** False until native secure storage or the web fallback is hydrated. */
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
  void saveBiometricUnlock(session);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start null so SSR HTML matches the first client render.
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void accountSessionStorage
      .hydrate()
      .then((persisted) => {
        if (!cancelled) setSession(persisted);
      })
      .catch(() => {
        // Native secure storage fails closed. The user can authenticate again
        // instead of falling back to a plaintext token store.
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const invalidate = () => setSession(null);
    window.addEventListener(SESSION_INVALIDATED_EVENT, invalidate);
    return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, invalidate);
  }, []);

  useEffect(() => {
    if (!isReady || !session?.accessToken) return;
    rememberSession(session);
    void captureSessionAttribution();
  }, [isReady, session]);

  useEffect(() => {
    if (!isReady || !session?.accessToken) return;
    let cancelled = false;
    void accountProfile
      .getMe()
      .then((user) => {
        if (cancelled) return;
        setSession((current) => {
          if (!current) return current;
          const next = { ...current, user };
          void apiClient.setSession(next);
          rememberSession(next);
          return next;
        });
      })
      .catch(() => {
        // Keep cached session user if /me is temporarily unavailable.
      });
    return () => {
      cancelled = true;
    };
    // Refresh once per authenticated bootstrap — not on every session write.
  }, [isReady, session?.accessToken]);

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
    const unlock = await readBiometricUnlock();
    if (!unlock?.refreshToken) {
      throw new ApiError(
        401,
        { message: "Biometric unlock unavailable" },
        "Biometric unlock unavailable",
      );
    }

    try {
      const pair = await accountAuth.refresh(unlock.refreshToken);
      const next: AuthSession = {
        ...unlock,
        ...pair,
      };
      await apiClient.setSession(next);
      rememberSession(next);
      setSession(next);
      void captureSessionAttribution();
      return next;
    } catch (error) {
      await clearBiometricUnlock();
      await apiClient.setSession(null);
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
      void apiClient.setSession(next);
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
    const { clearWorkoutPlanCache } = await import(
      "@/shared/lib/workout-plan-cache"
    );
    await clearWorkoutPlanCache();
    const { clearOfflineCheckinQueues } = await import(
      "@/modules/owner/lib/offline-checkin-queue"
    );
    await clearOfflineCheckinQueues();

    if (revoke) {
      try {
        await accountAuth.logout();
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          throw error;
        }
      } finally {
        await clearBiometricUnlock();
        setSession(null);
      }
      return;
    }

    // Soft lock: clear active session locally, keep biometric unlock payload.
    await apiClient.setSession(null);
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
