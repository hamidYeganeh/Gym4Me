import type { ApiClient } from "../client";
import { createAccountLifecycleApi } from "./lifecycle.client";

describe("lifecycle broadcast client", () => {
  it("maps bounded list and idempotent create", async () => {
    const request = jest.fn().mockResolvedValue({});
    const api = createAccountLifecycleApi({ request } as unknown as ApiClient);

    await api.listBroadcasts("club-1", 2, 50);
    await api.createBroadcast("club-1", {
      title: "تعطیلی",
      body: "باشگاه جمعه تعطیل است.",
      audience: "active_members",
      idempotencyKey: "broadcast-attempt-1",
    });

    expect(request.mock.calls).toEqual([
      ["/account/clubs/club-1/lifecycle/broadcasts?page=2&pageSize=50"],
      [
        "/account/clubs/club-1/lifecycle/broadcasts",
        {
          method: "POST",
          body: {
            title: "تعطیلی",
            body: "باشگاه جمعه تعطیل است.",
            audience: "active_members",
            idempotencyKey: "broadcast-attempt-1",
          },
        },
      ],
    ]);
  });
});
