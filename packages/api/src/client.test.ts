import { createApiClient } from "./client";
import type { ApiNotice } from "./notices";

describe("ApiClient notices", () => {
  it("sends Accept-Language for the active locale and toasts mapped errors", async () => {
    const notices: ApiNotice[] = [];
    const fetchImpl = jest.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Accept-Language")).toBe("fa-IR");
      return new Response(JSON.stringify({ message: "Invalid phone or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = createApiClient({
      baseUrl: "http://localhost/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
      locale: "fa",
    });
    client.subscribeNotices((notice) => notices.push(notice));

    await expect(
      client.request("/account/auth/login", {
        method: "POST",
        public: true,
        body: { phone: "09120000000", password: "x" },
      }),
    ).rejects.toMatchObject({ status: 401 });

    expect(notices).toEqual([
      {
        variant: "danger",
        messageKey: "exact.invalidPhoneOrPassword",
        sourceText: "Invalid phone or password",
      },
    ]);
  });
});
