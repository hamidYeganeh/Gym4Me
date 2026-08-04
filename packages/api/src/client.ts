import { ApiError } from "./errors";
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
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: HeadersInit;
  /** Skip Authorization header even if a token exists. */
  public?: boolean;
  signal?: AbortSignal;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly storage: TokenStorage | null;
  private readonly fetchImpl: typeof fetch;
  private readonly getAccessToken: () => string | null;
  private readonly onUnauthorized?: () => void;
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
  }

  /** Wire the refresh endpoint used by 401 retry (once per client). */
  configureRefresh(path: string) {
    this.refreshPath = path;
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
    const response = await this.send(path, options);

    if (
      response.status === 401 &&
      !options.public &&
      !isRetry &&
      this.refreshPath
    ) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        return this.request<T>(path, options, true);
      }
      this.storage?.set(null);
      this.onUnauthorized?.();
    }

    return this.parseResponse<T>(response);
  }

  private async send(path: string, options: RequestOptions): Promise<Response> {
    const url = this.buildUrl(path, options.query);
    const headers = new Headers(options.headers);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    let body: BodyInit | undefined;
    if (options.body !== undefined) {
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
  ): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalized}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
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
      throw new ApiError(
        response.status,
        (data as ApiErrorBody | null) ?? null,
        response.statusText || "Request failed",
      );
    }

    return data as T;
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
