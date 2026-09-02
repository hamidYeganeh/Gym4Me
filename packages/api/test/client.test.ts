import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../src/core/client";
import { ApiError } from "../src/core/error";

describe("ApiClient", () => {
  it("builds an authenticated JSON request with query parameters", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { id: "club-1" },
          meta: { request_id: "req-1", timestamp: "2026-08-31T00:00:00.000Z" },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const client = new ApiClient({
      baseUrl: "https://api.example.com/api/v1/",
      accessToken: "token",
      fetch: fetcher,
    });

    const result = await client.post<{ id: string }, { name: string }>(
      "/clubs",
      { name: "Gym" },
      {
        idempotencyKey: "idem-1",
        query: { locale: "fa", include: ["profile", "branches"] },
      },
    );

    expect(result.data.id).toBe("club-1");
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(
      "https://api.example.com/api/v1/clubs?locale=fa&include=profile&include=branches",
    );
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ name: "Gym" }));
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer token");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("idempotency-key")).toBe("idem-1");
  });

  it("maps the API error envelope to ApiError", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "CLUB_NOT_FOUND", message: "Club was not found.", request_id: "req-2" },
        }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const client = new ApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher });

    const request = client.get("/clubs/missing");

    await expect(request).rejects.toMatchObject<ApiError>({
      name: "ApiError",
      status: 404,
      code: "CLUB_NOT_FOUND",
      requestId: "req-2",
    });
  });

  it("normalizes transport failures", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("offline"));
    const client = new ApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher });

    await expect(client.get("/health")).rejects.toMatchObject<ApiError>({
      status: 0,
      code: "NETWORK_ERROR",
    });
  });
});
