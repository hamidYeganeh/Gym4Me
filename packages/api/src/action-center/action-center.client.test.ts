import { createApiClient } from "../client";
import { createAccountActionCenterApi } from "./action-center.client";

describe("action center client", () => {
  it("calls the role-scoped read model", async () => {
    const fetchImpl = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ generatedAt: "now", elapsedMs: 1, items: [] }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );
    const api = createAccountActionCenterApi(
      createApiClient({
        baseUrl: "https://api.example/api/v1",
        fetch: fetchImpl as unknown as typeof fetch,
      }),
    );

    await api.get();
    await api.click({ itemId: "booking-payment:1", kind: "athlete.booking_payment" });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/api/v1/account/action-center",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example/api/v1/account/action-center/click",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
