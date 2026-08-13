import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage: string) {
    const message = resolveMessage(body) ?? fallbackMessage;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function resolveMessage(body: ApiErrorBody | null): string | null {
  return flattenApiErrorMessage(body?.message);
}

function flattenApiErrorMessage(message: unknown): string | null {
  if (typeof message === "string") return message || null;
  if (Array.isArray(message)) {
    const parts = message.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
    return parts.length > 0 ? parts.join(", ") : null;
  }
  if (message && typeof message === "object") {
    const parts = Object.values(message as Record<string, unknown>).flatMap(
      (value) =>
        Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : typeof value === "string"
            ? [value]
            : [],
    );
    return parts.length > 0 ? parts.join(", ") : null;
  }
  return null;
}

export const KYC_REQUIRED_CODE = "KYC_REQUIRED";

/** True when the API rejected the action because identity (Shahkar) verification is missing. */
export function isKycRequiredError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.body?.code === KYC_REQUIRED_CODE
  );
}
