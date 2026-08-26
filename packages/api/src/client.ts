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
    const url = this.buildUrl(path, options.query, options.versionNeutral);
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
      method: this.resolveMethod(options),
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
          body: { refreshToken: current.refreshToken },
        });

        if (!response.ok) {
          await this.storage?.set(null);
          return null;
        }

        const pair = (await response.json()) as TokenPair;
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
  ): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const base = versionNeutral
      ? this.baseUrl.replace(/\/v\d+$/, "")
      : this.baseUrl;
    const url = new URL(`${base}${normalized}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(
          key,
          Array.isArray(value) ? value.join(",") : String(value),
        );
      }
    }
    return url.toString();
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
      this.raiseError(response, (data as ApiErrorBody | null) ?? null, options);
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
