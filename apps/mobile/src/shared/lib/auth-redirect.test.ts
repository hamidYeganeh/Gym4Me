import { describe, expect, it } from "@jest/globals";
import {
  needsPasswordSetup,
  postAuthPath,
} from "./auth-redirect";

jest.mock("@/modules/app/lib/onboarding-storage", () => ({
  hasCompletedOnboarding: jest.fn(() => false),
}));

describe("auth-redirect", () => {
  it("routes OTP-only accounts to set-password before onboarding", () => {
    const session = {
      activeRole: "athlete" as const,
      isNewUser: true,
      user: {
        id: "user-1",
        name: { first: "", last: null },
        credentials: { password: "unset" as const },
      },
    };

    expect(needsPasswordSetup(session)).toBe(true);
    expect(postAuthPath(session, "/athlete")).toBe(
      "/auth/set-password?next=%2Fathlete",
    );
  });

  it("continues to onboarding once a password exists", () => {
    const session = {
      activeRole: "athlete" as const,
      isNewUser: true,
      user: {
        id: "user-1",
        name: { first: "", last: null },
        credentials: { password: "set" as const },
      },
    };

    expect(postAuthPath(session, "/athlete")).toBe(
      "/onboarding?next=%2Fathlete",
    );
  });
});
