import type { ApiClient } from "../client";
import { createInventoryApi } from "./inventory.client";

describe("inventory client", () => {
  it("maps list/create/update/archive to the club-scoped contract", async () => {
    const request = jest.fn().mockResolvedValue({});
    const api = createInventoryApi({ request } as unknown as ApiClient);

    await api.list("club-1", { condition: "needs_repair" });
    await api.create("club-1", {
      name: "تردمیل",
      quantity: 1,
      idempotencyKey: "inventory-create-1",
    });
    await api.update("club-1", "item-1", {
      expectedVersion: 2,
      condition: "out_of_service",
    });
    await api.archive("club-1", "item-1", 3);

    expect(request.mock.calls).toEqual([
      ["/account/clubs/club-1/inventory", { query: { condition: "needs_repair" } }],
      [
        "/account/clubs/club-1/inventory",
        {
          method: "POST",
          body: {
            name: "تردمیل",
            quantity: 1,
            idempotencyKey: "inventory-create-1",
          },
        },
      ],
      [
        "/account/clubs/club-1/inventory/item-1",
        {
          method: "PATCH",
          body: { expectedVersion: 2, condition: "out_of_service" },
        },
      ],
      [
        "/account/clubs/club-1/inventory/item-1",
        { method: "DELETE", query: { expectedVersion: 3 } },
      ],
    ]);
  });
});
