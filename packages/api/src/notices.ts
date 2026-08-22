import { flattenApiErrorMessage, KYC_REQUIRED_CODE } from "./errors";
import { EXACT_API_MESSAGES } from "./notice-catalog";
import type { ApiErrorBody, ApiMessage } from "./types";

export type ApiNoticeVariant = "success" | "info" | "warning" | "danger";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiNotice = {
  variant: ApiNoticeVariant;
  /** next-intl key under the `Api` namespace. */
  messageKey: string;
  params?: Record<string, string | number>;
  /** Original payload text; used when the active locale is not `fa`. */
  sourceText?: string;
};

export type ResolveApiNoticeInput = {
  ok: boolean;
  status: number;
  method: HttpMethod;
  body: unknown;
  silent?: boolean;
};

function notice(
  variant: ApiNoticeVariant,
  messageKey: string,
  extra: Pick<ApiNotice, "params" | "sourceText"> = {},
): ApiNotice {
  const result: ApiNotice = { variant, messageKey };
  if (extra.params) result.params = extra.params;
  if (extra.sourceText) result.sourceText = extra.sourceText;
  return result;
}

const GENERIC_SUCCESS = new Set(["success", "ok", "done"]);

const NEST_STATUS_MESSAGES: Record<string, string> = {
  unauthorized: "errors.unauthorized",
  forbidden: "errors.forbidden",
  "not found": "errors.notFound",
  "bad request": "errors.badRequest",
  conflict: "errors.conflict",
  gone: "errors.gone",
  "too many requests": "errors.rateLimited",
  "internal server error": "errors.server",
  "service unavailable": "errors.unavailable",
  "payload too large": "errors.payloadTooLarge",
  "unsupported media type": "errors.unsupportedMedia",
  "unprocessable entity": "errors.unprocessable",
};

export function flattenApiMessage(message: unknown): string | null {
  const text = flattenApiErrorMessage(message);
  return text?.trim() || null;
}

export function isValidationMessage(message: unknown): boolean {
  return Boolean(
    message &&
    typeof message === "object" &&
    !Array.isArray(message) &&
    Object.keys(message as object).length > 0,
  );
}

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function entityKey(label: string): string {
  const words = label
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const [first, ...rest] = words;
  if (!first) return "item";
  return (
    first.toLowerCase() +
    rest
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  );
}

function statusMessageKey(status: number): string {
  if (status === 400) return "errors.badRequest";
  if (status === 401) return "errors.unauthorized";
  if (status === 403) return "errors.forbidden";
  if (status === 404) return "errors.notFound";
  if (status === 409) return "errors.conflict";
  if (status === 410) return "errors.gone";
  if (status === 413) return "errors.payloadTooLarge";
  if (status === 415) return "errors.unsupportedMedia";
  if (status === 422) return "errors.unprocessable";
  if (status === 429) return "errors.rateLimited";
  if (status === 503) return "errors.unavailable";
  if (status >= 500) return "errors.server";
  return "errors.generic";
}

function errorVariant(status: number, code?: string): ApiNoticeVariant {
  if (code === KYC_REQUIRED_CODE) return "warning";
  if (status === 429) return "warning";
  if (status === 400) return "warning";
  return "danger";
}

function fromExactOrPattern(
  text: string,
): Pick<ApiNotice, "messageKey" | "params"> {
  // New API responses return next-intl keys directly. Keep the legacy literal
  // catalog below for rolling deployments and older endpoints.
  if (/^(?:errors|success|exact|patterns)\.[a-zA-Z0-9.]+$/.test(text)) {
    return { messageKey: text };
  }
  const exact = EXACT_API_MESSAGES[normalize(text)];
  if (exact) return { messageKey: `exact.${exact}` };

  const notFound = /^(.*) not found$/i.exec(text.trim());
  if (notFound?.[1]) {
    return {
      messageKey: "patterns.notFound",
      params: { entity: entityKey(notFound[1]) },
    };
  }

  const notYours = /^not your (.+)$/i.exec(text.trim());
  if (notYours?.[1]) {
    return {
      messageKey: "patterns.notYours",
      params: { entity: entityKey(notYours[1]) },
    };
  }

  const nest = NEST_STATUS_MESSAGES[normalize(text)];
  if (nest) return { messageKey: nest };

  return { messageKey: "errors.generic" };
}

function payloadMessage(body: unknown): unknown {
  if (!body || typeof body !== "object") return undefined;
  return (body as { message?: ApiMessage }).message;
}

function payloadCode(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const code = (body as ApiErrorBody).code;
  return typeof code === "string" ? code : undefined;
}

export function resolveNetworkNotice(): ApiNotice {
  return { variant: "danger", messageKey: "errors.network" };
}

export function resolveApiNotice(
  input: ResolveApiNoticeInput,
): ApiNotice | null {
  if (input.silent) return null;

  if (input.ok) {
    if (input.method === "GET") return null;
    const text = flattenApiMessage(payloadMessage(input.body));
    if (!text || GENERIC_SUCCESS.has(normalize(text))) return null;
    const resolved = fromExactOrPattern(text);
    if (resolved.messageKey === "errors.generic") {
      return notice("success", "success.generic", { sourceText: text });
    }
    return notice("success", resolved.messageKey, {
      params: resolved.params,
      sourceText: text,
    });
  }

  const code = payloadCode(input.body);
  if (code === KYC_REQUIRED_CODE) {
    return notice("warning", "errors.kycRequired", {
      sourceText: flattenApiMessage(payloadMessage(input.body)) ?? undefined,
    });
  }

  const rawMessage = payloadMessage(input.body);
  if (isValidationMessage(rawMessage)) {
    return notice("warning", "errors.validation", {
      sourceText: flattenApiMessage(rawMessage) ?? undefined,
    });
  }

  const text = flattenApiMessage(rawMessage);
  const resolved = text
    ? fromExactOrPattern(text)
    : { messageKey: statusMessageKey(input.status) };
  const messageKey =
    resolved.messageKey === "errors.generic" && !text
      ? statusMessageKey(input.status)
      : resolved.messageKey === "errors.generic"
        ? statusMessageKey(input.status)
        : resolved.messageKey;

  return notice(errorVariant(input.status, code), messageKey, {
    params: resolved.params,
    sourceText: text ?? undefined,
  });
}

export function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function isNetworkError(error: unknown): boolean {
  if (isAbortError(error)) return false;
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  return /failed to fetch|networkerror|load failed|network request failed/i.test(
    error.message,
  );
}
