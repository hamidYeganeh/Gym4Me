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
  if (!body?.message) return null;
  return Array.isArray(body.message) ? body.message.join(", ") : body.message;
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
