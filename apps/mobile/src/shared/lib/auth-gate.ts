import {
  AUTH_SET_PASSWORD_PATH,
  authHref,
  needsPasswordSetup,
  needsProfileOnboarding,
  postAuthPath,
  setPasswordHref,
  type PostAuthSession,
} from "@/shared/lib/auth-redirect";

export type AuthGateDecision = {
  render: "children" | "shell";
  redirect: string | null;
};

type AuthGateInput = {
  guestOnly: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  next?: string | null;
  pathname?: string | null;
  session: PostAuthSession;
};

/** Pure routing policy shared by the auth gate's effect and render path. */
export function decideAuthGate(input: AuthGateInput): AuthGateDecision {
  if (!input.isReady) return { render: "shell", redirect: null };

  if (input.guestOnly) {
    return input.isAuthenticated
      ? {
          render: "shell",
          redirect: postAuthPath(input.session, input.next),
        }
      : { render: "children", redirect: null };
  }

  if (!input.isAuthenticated) {
    return {
      render: "shell",
      redirect: authHref(input.pathname || "/"),
    };
  }

  if (input.pathname?.startsWith(AUTH_SET_PASSWORD_PATH)) {
    return needsPasswordSetup(input.session)
      ? { render: "children", redirect: null }
      : {
          render: "shell",
          redirect: postAuthPath(input.session, input.next),
        };
  }

  if (needsPasswordSetup(input.session)) {
    const returnPath =
      input.pathname && input.pathname.startsWith("/")
        ? input.pathname
        : null;
    return {
      render: "shell",
      redirect: setPasswordHref(returnPath),
    };
  }

  if (
    input.pathname &&
    !input.pathname.startsWith("/onboarding") &&
    needsProfileOnboarding(input.session)
  ) {
    return {
      render: "shell",
      redirect: postAuthPath(input.session, input.pathname),
    };
  }

  return { render: "children", redirect: null };
}
