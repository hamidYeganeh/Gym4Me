import type { ApiSuccess } from "./contracts";
import { ApiError, toApiError } from "./error";
import { appendQuery, type QueryParams } from "./query-string";

export type AccessTokenResolver = () =>
  string | null | undefined | Promise<string | null | undefined>;

export interface ApiClientConfig {
  baseUrl: string;
  accessToken?: string | null;
  getAccessToken?: AccessTokenResolver;
  defaultHeaders?: HeadersInit;
  fetch?: typeof globalThis.fetch;
}

export interface ApiRequestOptions<TBody = unknown> extends Omit<RequestInit, "body" | "headers"> {
  accessToken?: string | null;
  body?: BodyInit | null;
  defaultErrorMessage?: string;
  headers?: HeadersInit;
  idempotencyKey?: string;
  json?: TBody;
  query?: QueryParams;
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiError("The API returned invalid JSON.", {
        status: response.status,
        code: "INVALID_JSON_RESPONSE",
      });
    }
  }

  return text;
}

export class ApiClient {
  readonly baseUrl: string;
  private accessToken: string | null | undefined;
  private readonly defaultHeaders: HeadersInit | undefined;
  private readonly fetcher: typeof globalThis.fetch;
  private readonly tokenResolver: AccessTokenResolver | undefined;

  constructor(config: ApiClientConfig) {
    if (!config.baseUrl.trim()) throw new Error("ApiClient requires a baseUrl.");
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
    this.defaultHeaders = config.defaultHeaders;
    this.fetcher = config.fetch ?? globalThis.fetch;
    this.tokenResolver = config.getAccessToken;
  }

  setAccessToken(accessToken: string | null | undefined): void {
    this.accessToken = accessToken;
  }

  private async resolveAccessToken(
    explicitToken: string | null | undefined,
  ): Promise<string | null | undefined> {
    if (explicitToken !== undefined) return explicitToken;
    if (this.tokenResolver) return this.tokenResolver();
    return this.accessToken;
  }

  async request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<ApiSuccess<TResponse>> {
    const {
      accessToken,
      body,
      defaultErrorMessage,
      headers: requestHeaders,
      idempotencyKey,
      json,
      query,
      ...requestInit
    } = options;

    if (body !== undefined && json !== undefined) {
      throw new Error("Use either body or json for an API request, not both.");
    }

    const headers = new Headers(this.defaultHeaders);
    new Headers(requestHeaders).forEach((value, key) => headers.set(key, value));
    headers.set("accept", "application/json");

    const token = await this.resolveAccessToken(accessToken);
    if (token) headers.set("authorization", `Bearer ${token}`);
    if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);

    let requestBody = body;
    if (json !== undefined) {
      headers.set("content-type", "application/json");
      requestBody = JSON.stringify(json);
    }

    try {
      const response = await this.fetcher(joinUrl(this.baseUrl, appendQuery(path, query)), {
        ...requestInit,
        ...(requestBody === undefined ? {} : { body: requestBody }),
        headers,
      });
      const payload = await parseResponse(response);

      if (!response.ok) {
        const error = toApiError(response.status, payload);
        if (defaultErrorMessage && error.code === `HTTP_${response.status}`) {
          throw new ApiError(defaultErrorMessage, {
            status: error.status,
            code: error.code,
          });
        }
        throw error;
      }

      return payload as ApiSuccess<TResponse>;
    } catch (error) {
      if (error instanceof ApiError || (error instanceof Error && error.name === "AbortError"))
        throw error;
      throw new ApiError("Unable to reach the API.", {
        status: 0,
        code: "NETWORK_ERROR",
        cause: error,
      });
    }
  }

  get<TResponse>(path: string, options?: ApiRequestOptions<never>): Promise<ApiSuccess<TResponse>> {
    return this.request<TResponse>(path, { ...options, method: "GET" });
  }

  post<TResponse, TBody = unknown>(
    path: string,
    json?: TBody,
    options?: ApiRequestOptions<TBody>,
  ): Promise<ApiSuccess<TResponse>> {
    return this.request<TResponse, TBody>(path, {
      ...options,
      method: "POST",
      ...(json === undefined ? {} : { json }),
    });
  }

  put<TResponse, TBody = unknown>(
    path: string,
    json?: TBody,
    options?: ApiRequestOptions<TBody>,
  ): Promise<ApiSuccess<TResponse>> {
    return this.request<TResponse, TBody>(path, {
      ...options,
      method: "PUT",
      ...(json === undefined ? {} : { json }),
    });
  }

  patch<TResponse, TBody = unknown>(
    path: string,
    json?: TBody,
    options?: ApiRequestOptions<TBody>,
  ): Promise<ApiSuccess<TResponse>> {
    return this.request<TResponse, TBody>(path, {
      ...options,
      method: "PATCH",
      ...(json === undefined ? {} : { json }),
    });
  }

  delete<TResponse>(
    path: string,
    options?: ApiRequestOptions<never>,
  ): Promise<ApiSuccess<TResponse>> {
    return this.request<TResponse>(path, { ...options, method: "DELETE" });
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
