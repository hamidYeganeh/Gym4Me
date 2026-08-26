import type { ApiClient } from "../client";
import { createOwnerCouponsApi } from "./coupons.client";

describe("owner coupons client", () => {
  it("keeps every operation club-scoped", async () => {
    const request = jest.fn().mockResolvedValue({});
    const api = createOwnerCouponsApi({ request } as unknown as ApiClient);

    await api.list("club-1", { status: ["active"] });
    await api.create("club-1", {
      code: "CLUB10",
      discount: { type: "percent", value: 10 },
    });
    await api.update("club-1", "coupon-1", { status: "inactive" });

    expect(request.mock.calls).toEqual([
      [
        "/account/clubs/club-1/coupons",
        { query: { status: ["active"] } },
      ],
      [
        "/account/clubs/club-1/coupons",
        {
          method: "POST",
          body: {
            code: "CLUB10",
            discount: { type: "percent", value: 10 },
          },
        },
      ],
      [
        "/account/clubs/club-1/coupons/coupon-1",
        { method: "PATCH", body: { status: "inactive" } },
      ],
    ]);
  });
});
