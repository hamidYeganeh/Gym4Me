import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, OtpRequested, PublicUser } from "@repo/api";
import { ApiError } from "@repo/api";
import { adminAuth } from "../lib/api";

type AuthContextValue = {
  session: AuthSession | null;
  user: PublicUser | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<AuthSession>;
  requestOtp: (phone: string) => Promise<OtpRequested>;
  loginWithOtp: (phone: string, code: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    adminAuth.getSession(),
  );

  const login = useCallback(async (phone: string, password: string) => {
    const next = await adminAuth.login({ phone, password });
    setSession(next);
    return next;
  }, []);

  const requestOtp = useCallback(
    (phone: string) => adminAuth.requestOtp({ phone }),
    [],
  );

  const loginWithOtp = useCallback(async (phone: string, code: string) => {
    const next = await adminAuth.confirmOtp({ phone, code });
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminAuth.logout();
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
      isAuthenticated: Boolean(session?.accessToken),
      login,
      requestOtp,
      loginWithOtp,
      logout,
    }),
    [session, login, requestOtp, loginWithOtp, logout],
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
