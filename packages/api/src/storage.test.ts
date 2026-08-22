import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { createLocalStorage, createMemoryStorage } from "./storage";
import type { AuthSession } from "./types";

const session = {
  accessToken: "access",
  refreshToken: "refresh",
  activeRole: "athlete" as const,
  isNewUser: false,
  user: {
    id: "user-1",
  },
} as AuthSession;

class TestLocalStorage implements Storage {
  readonly #values = new Map<string, string>();

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  getItem(key: string) {
    return this.#values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.#values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.#values.delete(key);
  }

  setItem(key: string, value: string) {
    this.#values.set(key, value);
  }
}

describe("token storage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: new TestLocalStorage() },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
    jest.restoreAllMocks();
  });

  it("keeps memory storage instances isolated", () => {
    const first = createMemoryStorage();
    const second = createMemoryStorage();

    first.set(session);

    expect(first.get()).toEqual(session);
    expect(second.get()).toBeNull();
  });

  it("round-trips and clears a browser session", () => {
    const storage = createLocalStorage("gym4me.test.session");

    storage.set(session);
    expect(storage.get()).toEqual(session);

    storage.set(null);
    expect(storage.get()).toBeNull();
  });

  it("treats malformed persisted JSON as a signed-out session", () => {
    window.localStorage.setItem("gym4me.test.session", "{broken");

    expect(createLocalStorage("gym4me.test.session").get()).toBeNull();
  });

  it("uses isolated memory storage during SSR", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });
    const firstRequest = createLocalStorage("gym4me.test.session");
    const secondRequest = createLocalStorage("gym4me.test.session");

    firstRequest.set(session);

    expect(firstRequest.get()).toEqual(session);
    expect(secondRequest.get()).toBeNull();
  });
});
