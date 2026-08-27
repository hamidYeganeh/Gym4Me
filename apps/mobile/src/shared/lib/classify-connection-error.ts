import { ApiError } from "@repo/api";
import { isNetworkError } from "@repo/api";

export type ConnectionErrorKind = "network" | "server";

export type ClassifiedConnectionError = {
  kind: ConnectionErrorKind;
  statusCode?: number;
};

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * - Offline (no internet on device) → network
 * - Online but fetch failed before any HTTP response → server unreachable
 * - Online with an HTTP error response → server
 */
export function classifyConnectionError(
  cause: unknown,
): ClassifiedConnectionError {
  if (isBrowserOffline()) {
    return { kind: "network" };
  }

  if (cause instanceof ApiError) {
    return {
      kind: "server",
      statusCode: cause.status,
    };
  }

  if (isNetworkError(cause)) {
    return { kind: "server", statusCode: 503 };
  }

  return { kind: "server", statusCode: 500 };
}
