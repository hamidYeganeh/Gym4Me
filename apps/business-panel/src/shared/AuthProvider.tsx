import type { AccessAssignment, AccessContext } from "@repo/api/v2";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  accountApi,
  apiClient,
  BUSINESS_SESSION_INVALIDATED,
  readStoredSession,
  writeStoredSession,
  type StoredBusinessSession,
} from "./api";
import { selectBusinessAssignment } from "./auth-policy";

type BusinessUser = { id: string; displayName: string; mobile?: string };
type AuthContextValue = {
  session: StoredBusinessSession | null;
  user: BusinessUser | null;
  assignment: AccessAssignment | null;
  context: AccessContext | null;
  isReady: boolean;
  isAuthenticated: boolean;
  requestOtp: (phone: string) => Promise<void>;
  loginWithOtp: (phone: string, code: string) => Promise<void>;
  loginWithPassword: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

async function activateBusinessContext(base: StoredBusinessSession) {
  apiClient.setAccessToken(base.accessToken);
  const access = await accountApi.getAccessContext(apiClient);
  const assignment = selectBusinessAssignment(access.assignments);
  if (!assignment) throw new Error("برای ورود به پنل، دسترسی مالک یا پرسنل باشگاه لازم است.");
  const activated = await accountApi.activateAccessContext(apiClient, {
    role_id: assignment.role_id,
    scope_type: assignment.scope_type,
    ...(assignment.scope_id ? { scope_id: assignment.scope_id } : {}),
  });
  const session = { ...base, accessToken: activated.access_token };
  apiClient.setAccessToken(session.accessToken);
  writeStoredSession(session);
  const result = await accountApi.getProfile(apiClient);
  const userRecord = result.user;
  const profile = result.profile ?? {};
  const identity = (profile.identity ?? {}) as Record<string, unknown>;
  const contact = (userRecord.contact ?? {}) as Record<string, unknown>;
  const mobile = (contact.mobile ?? {}) as Record<string, unknown>;
  const joined = [nonEmpty(identity.firstName), nonEmpty(identity.lastName)].filter(Boolean).join(" ");
  return {
    session,
    assignment,
    context: activated.context,
    user: {
      id: base.userId,
      displayName: nonEmpty(identity.displayName) ?? (joined || "کاربر باشگاه"),
      ...(nonEmpty(mobile.value) ? { mobile: nonEmpty(mobile.value) } : {}),
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredBusinessSession | null>(null);
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [assignment, setAssignment] = useState<AccessAssignment | null>(null);
  const [context, setContext] = useState<AccessContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  const clear = useCallback(() => {
    apiClient.setAccessToken(null);
    writeStoredSession(null);
    setSession(null);
    setUser(null);
    setAssignment(null);
    setContext(null);
  }, []);

  const apply = useCallback(async (base: StoredBusinessSession) => {
    const next = await activateBusinessContext(base);
    setSession(next.session);
    setUser(next.user);
    setAssignment(next.assignment);
    setContext(next.context);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stored = readStoredSession();
    if (!stored) {
      setIsReady(true);
      return;
    }
    void accountApi.refreshToken(apiClient, stored.refreshToken)
      .then((tokens) => apply({
        userId: stored.userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      }))
      .catch(clear)
      .finally(() => { if (!cancelled) setIsReady(true); });
    return () => { cancelled = true; };
  }, [apply, clear]);

  useEffect(() => {
    const invalidate = () => clear();
    window.addEventListener(BUSINESS_SESSION_INVALIDATED, invalidate);
    return () => window.removeEventListener(BUSINESS_SESSION_INVALIDATED, invalidate);
  }, [clear]);

  const finishLogin = useCallback(async (result: {
    user_id: string;
    tokens: { access_token: string; refresh_token: string };
  }) => {
    await apply({
      userId: result.user_id,
      accessToken: result.tokens.access_token,
      refreshToken: result.tokens.refresh_token,
    });
  }, [apply]);

  const requestOtp = useCallback(async (phone: string) => {
    await accountApi.requestOtp(apiClient, { mobile: phone, purpose: "LOGIN" });
  }, []);
  const loginWithOtp = useCallback(async (phone: string, code: string) => {
    await finishLogin(await accountApi.verifyOtp(apiClient, { mobile: phone, code, purpose: "LOGIN" }));
  }, [finishLogin]);
  const loginWithPassword = useCallback(async (phone: string, password: string) => {
    await finishLogin(await accountApi.passwordLogin(apiClient, { mobile: phone, password }));
  }, [finishLogin]);
  const logout = useCallback(async () => {
    try { if (session) await accountApi.logout(apiClient); } finally { clear(); }
  }, [clear, session]);

  const value = useMemo<AuthContextValue>(() => ({
    session, user, assignment, context, isReady,
    isAuthenticated: Boolean(session?.accessToken && assignment),
    requestOtp, loginWithOtp, loginWithPassword, logout,
  }), [assignment, context, isReady, loginWithOtp, loginWithPassword, logout, requestOtp, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
