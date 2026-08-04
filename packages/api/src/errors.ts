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
