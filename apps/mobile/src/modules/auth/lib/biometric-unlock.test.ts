const mockSecureValues = new Map<string, string>();

jest.mock("@/shared/lib/native-secure-store", () => ({
  getNativeSecureStore: async () => ({
    isNative: true,
    getItem: async (key: string) => mockSecureValues.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      mockSecureValues.set(key, value);
    },
    removeItem: async (key: string) => {
      mockSecureValues.delete(key);
    },
  }),
}));

import type { AuthSession } from "@repo/api";
import {
  clearBiometricUnlock,
  readBiometricUnlock,
  saveBiometricUnlock,
} from "./biometric-unlock";

class TestLocalStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const session = {
  accessToken: "access-secret",
  refreshToken: "refresh-secret",
  activeRole: "athlete",
  user: { id: "665f0a1b2c3d4e5f67890101" },
  isNewUser: false,
} as AuthSession;

describe("biometric unlock storage", () => {
  beforeEach(async () => {
    mockSecureValues.clear();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: new TestLocalStorage() },
    });
    await clearBiometricUnlock();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  it("stores only the refresh snapshot in native secure storage", async () => {
    await saveBiometricUnlock(session);

    const raw = mockSecureValues.get("gym4me.auth.biometricUnlock")!;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    expect(saved.refreshToken).toBe("refresh-secret");
    expect(saved).not.toHaveProperty("accessToken");
    expect(
      window.localStorage.getItem("gym4me.auth.biometricUnlock"),
    ).toBeNull();
  });

  it("migrates a legacy plaintext snapshot without copying its access token", async () => {
    window.localStorage.setItem(
      "gym4me.auth.biometricUnlock",
      JSON.stringify(session),
    );

    await expect(readBiometricUnlock()).resolves.toEqual({
      refreshToken: "refresh-secret",
      activeRole: "athlete",
      user: session.user,
      isNewUser: false,
    });
    const migrated = JSON.parse(
      mockSecureValues.get("gym4me.auth.biometricUnlock")!,
    ) as Record<string, unknown>;
    expect(migrated).not.toHaveProperty("accessToken");
    expect(
      window.localStorage.getItem("gym4me.auth.biometricUnlock"),
    ).toBeNull();
  });

  it("clears the native refresh snapshot on hard logout", async () => {
    await saveBiometricUnlock(session);
    await clearBiometricUnlock();

    expect(mockSecureValues.has("gym4me.auth.biometricUnlock")).toBe(false);
  });
});
