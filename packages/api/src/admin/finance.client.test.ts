import { createApiClient } from "../client";
import { createAdminFinanceApi } from "./finance.client";

describe("admin finance client", () => {
  it("lists bounded wallets and rebuilds only the selected owner cache", async () => {
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("wallets?")) {
        expect(url).toBe(
          "https://api.example/api/v1/admin/finance/wallets?page=2&page_size=40&type=club&ownerId=507f1f77bcf86cd799439011",
        );
        return new Response(
          JSON.stringify({
            message: "success.generic",
            result: [],
            pagination: { page: 2, page_size: 40, next: null, prev: 1, count: 0, total: 0 },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      expect(url).toBe(
        "https://api.example/api/v1/admin/finance/wallets/rebuild",
      );
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({
        type: "club",
        id: "507f1f77bcf86cd799439011",
      });
      return new Response(
        JSON.stringify({
          owner: { type: "club", id: "507f1f77bcf86cd799439011" },
          previousBalance: 1200,
          balance: 1000,
          corrected: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const api = createAdminFinanceApi(
      createApiClient({
        baseUrl: "https://api.example/api/v1",
        fetch: fetchImpl as unknown as typeof fetch,
      }),
    );

    await api.listWallets({
      page: 2,
      page_size: 40,
      type: "club",
      ownerId: "507f1f77bcf86cd799439011",
    });
    await api.rebuildWallet({
      type: "club",
      id: "507f1f77bcf86cd799439011",
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
