import { ApiError, flattenApiErrorMessage, KYC_REQUIRED_CODE } from "./errors";
import {
  isAbortError,
  isNetworkError,
  resolveApiNotice,
  resolveNetworkNotice,
  type ApiNotice,
  type HttpMethod,
} from "./notices";
import type { ApiErrorBody, AuthSession, TokenPair } from "./types";
import type { TokenStorage } from "./storage";

export type ApiNoticeListener = (notice: ApiNotice) => void;

export type ApiClientOptions = {
  /** Base URL including version, e.g. `http://localhost:8088/api/v1` */
  baseUrl: string;
  storage?: TokenStorage;
  /** Optional custom fetch (tests / Capacitor). */
  fetch?: typeof fetch;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
  /** Called when a 403 with `code: 'KYC_REQUIRED'` is returned (identity verification needed). */
  onKycRequired?: (body: ApiErrorBody | null) => void;
  /** Initial UI locale used for `Accept-Language`. */
  locale?: string;
};

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** Multipart body — Content-Type is left unset so the boundary is set by fetch. */
  formData?: FormData;
  query?: Record<
    string,
    | string
    | number
    | boolean
    | readonly (string | number | boolean)[]
    | undefined
    | null
  >;
  headers?: HeadersInit;
  /** Skip Authorization header even if a token exists. */
  public?: boolean;
  /** Skip the global API toast for this request. */
  silent?: boolean;
  /**
   * Call a VERSION_NEUTRAL route under `/api/...` instead of `/api/vN/...`.
   * Strips a trailing `/v\\d+` segment from the configured baseUrl.
   */
  versionNeutral?: boolean;
  signal?: AbortSignal;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly storage: TokenStorage | null;
  private readonly fetchImpl: typeof fetch;
  private readonly getAccessToken: () => string | null;
  private readonly onUnauthorized?: () => void;
  private readonly onKycRequired?: (body: ApiErrorBody | null) => void;
  private readonly noticeListeners = new Set<ApiNoticeListener>();
  private messageResolver?: (messageKey: string) => string;
  private locale: string;
  private refreshPromise: Promise<TokenPair | null> | null = null;
  private refreshPath: string | null = null;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.storage = options.storage ?? null;
    this.fetchImpl = options.fetch ?? fetch.bind(globalThis);
    this.getAccessToken =
      options.getAccessToken ??
      (() => this.storage?.get()?.accessToken ?? null);
    this.onUnauthorized = options.onUnauthorized;
    this.onKycRequired = options.onKycRequired;
    this.locale = options.locale ?? "fa";
  }

  /** Keep API `Accept-Language` aligned with the active UI locale. */
  setLocale(locale: string) {
    this.locale = locale;
  }

  subscribeNotices(listener: ApiNoticeListener): () => void {
    this.noticeListeners.add(listener);
    return () => {
      this.noticeListeners.delete(listener);
    };
  }

  /** Let the active next-intl provider localize keyed API errors for forms. */
  setMessageResolver(resolver?: (messageKey: string) => string) {
    this.messageResolver = resolver;
  }

  /** Wire the refresh endpoint used by 401 retry (once per client). */
  configureRefresh(path: string) {
    this.refreshPath = path;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getSession(): AuthSession | null {
    return this.storage?.get() ?? null;
  }

  async setSession(session: AuthSession | null): Promise<void> {
    await this.storage?.set(session);
  }

  async request<T>(
    path: string,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    try {
      const response = await this.sendWithAuthRetry(path, options, isRetry);
      return await this.parseResponse<T>(response, options);
    } catch (error) {
      this.emitTransportNotice(error, options.silent === true);
      throw error;
    }
  }

  /** Authenticated binary download (KYC docs, exports). */
  async requestBlob(
    path: string,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<Blob> {
    try {
      const response = await this.sendWithAuthRetry(path, options, isRetry);
      if (!response.ok) {
        const text = await response.text();
        let data: ApiErrorBody | null = null;
        try {
          data = text ? (JSON.parse(text) as ApiErrorBody) : null;
        } catch {
          data = null;
        }
        this.raiseError(response, data, options);
      }
      return response.blob();
    } catch (error) {
      this.emitTransportNotice(error, options.silent === true);
      throw error;
    }
  }

  private emitNotice(notice: ApiNotice | null) {
    if (!notice) return;
    for (const listener of this.noticeListeners) {
      listener(notice);
    }
  }

  private emitTransportNotice(error: unknown, silent: boolean) {
    if (silent || error instanceof ApiError || isAbortError(error)) return;
    if (isNetworkError(error)) {
      this.emitNotice(resolveNetworkNotice());
    }
  }

  private resolveMethod(options: RequestOptions): HttpMethod {
    return (
      options.method ??
      (options.body !== undefined || options.formData ? "POST" : "GET")
    );
  }

  private acceptLanguage(): string {
    const locale = this.locale.trim() || "fa";
    if (locale === "fa" || locale.startsWith("fa-")) return "fa-IR";
    if (locale === "en" || locale.startsWith("en-")) return "en";
    return locale;
  }

  private async sendWithAuthRetry(
    path: string,
    options: RequestOptions,
    isRetry: boolean,
  ): Promise<Response> {
    const response = await this.send(path, options);

    if (
      response.status === 401 &&
      !options.public &&
      !isRetry &&
      this.refreshPath
    ) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        return this.sendWithAuthRetry(path, options, true);
      }
      await this.storage?.set(null);
      this.onUnauthorized?.();
    }

    return response;
  }

  private async send(path: string, options: RequestOptions): Promise<Response> {
    const method = this.resolveMethod(options);
    const url = this.buildUrl(path, options.query, options.versionNeutral, method);
    const headers = new Headers(options.headers);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    if (!headers.has("Accept-Language")) {
      headers.set("Accept-Language", this.acceptLanguage());
    }

    let body: BodyInit | undefined;
    if (options.formData) {
      body = options.formData;
    } else if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    if (!options.public) {
      const token = this.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return this.fetchImpl(url, {
      method,
      headers,
      body,
      signal: options.signal,
      // Avoid browser HTTP cache of GETs (API may send long max-age on catalogs).
      cache: "no-store",
    });
  }

  private async refreshTokens(): Promise<TokenPair | null> {
    if (!this.refreshPath || !this.storage) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const current = this.storage?.get();
        if (!current?.refreshToken) return null;

        const response = await this.send(this.refreshPath!, {
          method: "POST",
          public: true,
          silent: true,
          body: { refresh_token: current.refreshToken },
        });

        if (!response.ok) {
          await this.storage?.set(null);
          return null;
        }

        const payload = (await response.json()) as {
          data?: { access_token?: string; refresh_token?: string };
          accessToken?: string;
          refreshToken?: string;
        };
        const source = (payload.data ?? payload) as {
          accessToken?: string;
          refreshToken?: string;
          access_token?: string;
          refresh_token?: string;
        };
        const pair: TokenPair = {
          accessToken: source.accessToken ?? source.access_token ?? "",
          refreshToken: source.refreshToken ?? source.refresh_token ?? "",
        };
        if (!pair.accessToken || !pair.refreshToken) {
          await this.storage?.set(null);
          return null;
        }
        await this.storage?.set({
          ...current,
          accessToken: pair.accessToken,
          refreshToken: pair.refreshToken,
        });
        return pair;
      })().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private buildUrl(
    path: string,
    query?: RequestOptions["query"],
    versionNeutral?: boolean,
    method: HttpMethod = "GET",
  ): string {
    const original = path.startsWith("/") ? path : `/${path}`;
    const normalized = this.compatibilityPath(original, method);
    const base = versionNeutral
      ? this.baseUrl.replace(/\/v\d+$/, "")
      : this.baseUrl;
    const url = new URL(`${base}${normalized}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(
          key === "page_size" ? "limit" : key,
          Array.isArray(value) ? value.join(",") : String(value),
        );
      }
    }
    return url.toString();
  }

  /** Translate app-v1 routes that have direct equivalents in the current API. */
  private compatibilityPath(path: string, method: HttpMethod): string {
    const exact: Record<string, string> = {
      "/account/finance/wallet": "/finance/wallet/me",
      "/account/finance/wallet/overview": "/finance/wallet/me",
      "/account/finance/payments": "/finance/payments/me",
      "/account/finance/invoices": "/finance/invoices/me",
      "/account/memberships": "/memberships/me",
      "/account/notifications": "/notifications/me",
      "/account/notifications/preferences": "/notifications/preferences/me",
      "/account/notifications/read-all": "/notifications/me/read-all",
      "/account/devices": "/notifications/devices/me",
      "/account/waitlists/mine": "/bookings/waitlist/me",
      "/account/waitlists/join": "/bookings/waitlist",
      "/discovery/clubs": "/catalog/branches",
      "/discovery/coaches": "/catalog/coaches",
      "/admin/users": "/admin/access/users",
    };
    if (path === "/account/bookings" && method === "GET") return "/bookings/me";
    if (exact[path]) return exact[path];
    return path
      .replace(/^\/account\/notifications\/([^/]+)\/read$/, "/notifications/$1/read")
      .replace(/^\/account\/bookings\/([^/]+)\/cancellation-preview$/, "/bookings/$1/cancellation-preview")
      .replace(/^\/account\/bookings\/([^/]+)\/cancel$/, "/bookings/$1/cancel")
      .replace(/^\/account\/bookings\/([^/]+)$/, "/bookings/$1")
      .replace(/^\/discovery\/clubs\/([^/]+)$/, "/catalog/branches/$1")
      .replace(/^\/discovery\/coaches\/([^/]+)$/, "/catalog/coaches/$1")
      .replace(/^\/admin\/users\/([^/]+)$/, "/admin/access/users/$1");
  }

  private async parseResponse<T>(
    response: Response,
    options: RequestOptions,
  ): Promise<T> {
    if (response.status === 204) {
      this.emitNotice(
        resolveApiNotice({
          ok: true,
          status: 204,
          method: this.resolveMethod(options),
          body: null,
          silent: options.silent,
        }),
      );
      return undefined as T;
    }

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch (error) {
        if (response.ok) throw error;
        data = null;
      }
    }

    if (!response.ok) {
      const nested =
        data && typeof data === "object" && "error" in data
          ? (data as { error?: unknown }).error
          : null;
      const errorBody =
        nested && typeof nested === "object"
          ? {
              statusCode: response.status,
              code: "code" in nested ? String(nested.code) : undefined,
              message: "message" in nested ? String(nested.message) : undefined,
            }
          : ((data as ApiErrorBody | null) ?? null);
      this.raiseError(response, errorBody, options);
    }

    this.emitNotice(
      resolveApiNotice({
        ok: true,
        status: response.status,
        method: this.resolveMethod(options),
        body: data,
        silent: options.silent,
      }),
    );

    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      "meta" in data
    ) {
      const envelope = data as {
        data: T;
        meta?: {
          pagination?: {
            page?: number;
            limit?: number;
            total?: number;
            pages?: number;
            [key: string]: unknown;
          };
        };
      };
      const pagination = envelope.meta?.pagination;
      if (pagination && Array.isArray(envelope.data)) {
        const page = pagination.page ?? 1;
        const pageSize = pagination.limit ?? envelope.data.length;
        const count = pagination.total ?? envelope.data.length;
        return {
          result: envelope.data,
          pagination: {
            page,
            page_size: pageSize,
            count,
            total: count,
            prev: page > 1 ? page - 1 : null,
            next: page * pageSize < count ? page + 1 : null,
            ...(pagination.unread !== undefined ? { unread: pagination.unread } : {}),
          },
        } as T;
      }
      if (
        envelope.data &&
        typeof envelope.data === "object" &&
        "items" in envelope.data &&
        Array.isArray((envelope.data as { items?: unknown }).items)
      ) {
        const collection = envelope.data as { items: unknown[]; total?: number };
        const requestedPage = Number(options.query?.page ?? 1);
        const requestedPageSize = Number(
          options.query?.page_size ?? options.query?.limit ?? collection.items.length,
        );
        const page = pagination?.page ?? requestedPage;
        const pageSize = pagination?.limit ?? requestedPageSize;
        const count = collection.total ?? collection.items.length;
        return {
          result: collection.items,
          pagination: {
            page,
            page_size: pageSize,
            count,
            total: count,
            prev: page > 1 ? page - 1 : null,
            next: page * pageSize < count ? page + 1 : null,
          },
        } as T;
      }
      return envelope.data;
    }

    return data as T;
  }

  private raiseError(
    response: Response,
    body: ApiErrorBody | null,
    options: RequestOptions,
  ): never {
    if (response.status === 403 && body?.code === KYC_REQUIRED_CODE) {
      this.onKycRequired?.(body);
    }
    const sessionExpired =
      response.status === 401 && !options.public && !this.getAccessToken();
    this.emitNotice(
      resolveApiNotice({
        ok: false,
        status: response.status,
        method: this.resolveMethod(options),
        body: body,
        silent: options.silent || sessionExpired,
      }),
    );
    throw new ApiError(
      response.status,
      body,
      response.statusText || "Request failed",
      (() => {
        const key = flattenApiErrorMessage(body?.message);
        return key && this.messageResolver
          ? this.messageResolver(key)
          : undefined;
      })(),
    );
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

export { ApiError, KYC_REQUIRED_CODE };
export type { ApiNotice } from "./notices";
