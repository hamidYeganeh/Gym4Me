import type { ApiErrorShape } from "./contracts";

export interface ApiErrorOptions {
  status: number;
  code: string;
  details?: Record<string, unknown>;
  requestId?: string;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown> | undefined;
  readonly requestId: string | undefined;

  constructor(message: string, options: ApiErrorOptions) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
  }
}

export function isApiErrorShape(value: unknown): value is ApiErrorShape {
  if (!value || typeof value !== "object" || !("error" in value)) return false;
  const error = value.error;
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string",
  );
}

export function toApiError(status: number, payload: unknown): ApiError {
  if (isApiErrorShape(payload)) {
    return new ApiError(payload.error.message, {
      status,
      code: payload.error.code,
      ...(payload.error.details ? { details: payload.error.details } : {}),
      ...(payload.error.request_id ? { requestId: payload.error.request_id } : {}),
    });
  }

  return new ApiError(`API request failed with status ${status}.`, {
    status,
    code: `HTTP_${status}`,
  });
}
