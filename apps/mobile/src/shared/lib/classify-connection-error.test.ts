import { ApiError } from "@repo/api";
import {
  classifyConnectionError,
  isBrowserOffline,
} from "./classify-connection-error";

describe("classifyConnectionError", () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(
    navigator,
    "onLine",
  );

  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(navigator, "onLine", originalOnLine);
    }
  });

  function setOnline(value: boolean) {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => value,
    });
  }

  it("maps offline device to network errors", () => {
    setOnline(false);
    expect(classifyConnectionError(new TypeError("Failed to fetch"))).toEqual({
      kind: "network",
    });
  });

  it("maps online transport failures to server unreachable", () => {
    setOnline(true);
    expect(classifyConnectionError(new TypeError("Failed to fetch"))).toEqual({
      kind: "server",
      statusCode: 503,
    });
  });

  it("maps HTTP API failures to server errors", () => {
    setOnline(true);
    expect(
      classifyConnectionError(new ApiError(502, null, "Bad Gateway")),
    ).toEqual({
      kind: "server",
      statusCode: 502,
    });
  });
});

describe("isBrowserOffline", () => {
  it("reflects navigator.onLine", () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    expect(isBrowserOffline()).toBe(true);
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => original,
    });
  });
});
