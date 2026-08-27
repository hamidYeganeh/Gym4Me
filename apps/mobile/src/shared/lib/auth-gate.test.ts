import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { decideAuthGate } from "./auth-gate";

jest.mock("@/modules/app/lib/onboarding-storage", () => ({
  hasCompletedOnboarding: jest.fn(() => false),
}));

const completeSession = {
  activeRole: "coach" as const,
  isNewUser: false,
  user: {
    id: "user-1",
    name: { first: "مهدی", last: null },
    credentials: { password: "set" as const },
  },
};

describe("decideAuthGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the loading shell stable until auth hydration completes", () => {
    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: false,
        isReady: false,
        pathname: "/coach",
        session: completeSession,
      }),
    ).toEqual({ render: "shell", redirect: null });
  });

  it("sends a protected deep link through auth with an encoded return path", () => {
    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: false,
        isReady: true,
        pathname: "/athlete/bookings?id=12",
        session: completeSession,
      }),
    ).toEqual({
      render: "shell",
      redirect: "/auth?next=%2Fathlete%2Fbookings%3Fid%3D12",
    });
  });

  it("keeps an incomplete profile in onboarding without creating a redirect loop", () => {
    const incomplete = {
      ...completeSession,
      isNewUser: true,
      user: { ...completeSession.user, name: { first: "", last: null } },
    };

    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: true,
        isReady: true,
        pathname: "/owner/finance",
        session: incomplete,
      }),
    ).toEqual({
      render: "shell",
      redirect: "/onboarding?next=%2Fowner%2Ffinance",
    });

    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: true,
        isReady: true,
        pathname: "/onboarding",
        session: incomplete,
      }),
    ).toEqual({ render: "children", redirect: null });
  });

  it("redirects authenticated guests to a safe role-aware destination", () => {
    expect(
      decideAuthGate({
        guestOnly: true,
        isAuthenticated: true,
        isReady: true,
        next: "https://malicious.example",
        pathname: "/auth",
        session: completeSession,
      }),
    ).toEqual({ render: "shell", redirect: "/coach" });
  });

  it("renders protected content for an authenticated complete profile", () => {
    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: true,
        isReady: true,
        pathname: "/coach",
        session: completeSession,
      }),
    ).toEqual({ render: "children", redirect: null });
  });

  it("sends OTP-only accounts to set-password before the rest of the app", () => {
    const otpOnly = {
      ...completeSession,
      user: {
        ...completeSession.user,
        credentials: { password: "unset" as const },
      },
    };

    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: true,
        isReady: true,
        pathname: "/athlete",
        session: otpOnly,
      }),
    ).toEqual({
      render: "shell",
      redirect: "/auth/set-password?next=%2Fathlete",
    });

    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: true,
        isReady: true,
        pathname: "/auth/set-password",
        session: otpOnly,
      }),
    ).toEqual({ render: "children", redirect: null });
  });

  it("skips set-password once a password is configured", () => {
    expect(
      decideAuthGate({
        guestOnly: false,
        isAuthenticated: true,
        isReady: true,
        pathname: "/auth/set-password",
        session: completeSession,
      }),
    ).toEqual({ render: "shell", redirect: "/coach" });
  });
});
