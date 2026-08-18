import { ApiError, KYC_REQUIRED_CODE } from "./errors";
import type { ApiErrorBody, AuthSession, TokenPair } from "./types";
import type { TokenStorage } from "./storage";

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
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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

  setSession(session: AuthSession | null) {
    this.storage?.set(session);
  }

  async request<T>(
    path: string,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    const response = await this.sendWithAuthRetry(path, options, isRetry);
    return this.parseResponse<T>(response);
  }

  /** Authenticated binary download (KYC docs, exports). */
  async requestBlob(
    path: string,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<Blob> {
    const response = await this.sendWithAuthRetry(path, options, isRetry);
    if (!response.ok) {
      const text = await response.text();
      let data: ApiErrorBody | null = null;
      try {
        data = text ? (JSON.parse(text) as ApiErrorBody) : null;
      } catch {
        data = null;
      }
      this.raiseError(response, data);
    }
    return response.blob();
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
      this.storage?.set(null);
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
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers,
      body,
      signal: options.signal,
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
          body: { refreshToken: current.refreshToken },
        });

        if (!response.ok) {
          this.storage?.set(null);
          return null;
        }

        const pair = (await response.json()) as TokenPair;
        this.storage?.set({
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

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      this.raiseError(response, (data as ApiErrorBody | null) ?? null);
    }

    return data as T;
  }

  private raiseError(response: Response, body: ApiErrorBody | null): never {
    if (response.status === 403 && body?.code === KYC_REQUIRED_CODE) {
      this.onKycRequired?.(body);
    }
    throw new ApiError(
      response.status,
      body,
      response.statusText || "Request failed",
    );
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

export { ApiError, KYC_REQUIRED_CODE };
