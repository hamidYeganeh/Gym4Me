import { createApiClient } from "../client";
import { createAccountWaitlistApi } from "./waitlist.client";

describe("account waitlist client", () => {
  it("claims through the atomic booking endpoint", async () => {
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(
        "https://api.example/api/v1/account/bookings/waitlist/waitlist-1/claim",
      );
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ entryId: "entry-1" });
      return new Response(
        JSON.stringify({
          recurringGroupId: null,
          bookings: [{ id: "booking-1", status: "awaiting_payment" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const api = createAccountWaitlistApi(
      createApiClient({
        baseUrl: "https://api.example/api/v1",
        fetch: fetchImpl as unknown as typeof fetch,
      }),
    );

    const result = await api.claim("waitlist-1", { entryId: "entry-1" });

    expect(result.bookings[0]?.id).toBe("booking-1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
