import { loadRemoteData } from "./remote-data";

describe("loadRemoteData", () => {
  it("keeps a successful empty response empty", async () => {
    await expect(
      loadRemoteData({
        load: async () => [],
        isEmpty: (items) => !items.length,
      }),
    ).resolves.toEqual({ status: "empty", data: [] });
  });

  it.each([
    ["404", Object.assign(new Error("not found"), { status: 404 })],
    ["401", Object.assign(new Error("unauthorized"), { status: 401 })],
    ["timeout", new Error("timeout")],
  ])("keeps %s failures distinguishable from empty", async (_name, error) => {
    const result = await loadRemoteData({
      load: async () => Promise.reject(error),
      isEmpty: (items: unknown[]) => !items.length,
    });

    expect(result).toEqual({ status: "error", error });
  });

  it("returns the last real cache as stale while offline", async () => {
    const cached = [{ id: "665f0a1b2c3d4e5f67890101" }];

    await expect(
      loadRemoteData({
        load: async () => Promise.reject(new Error("offline")),
        isEmpty: (items: typeof cached) => !items.length,
        readCache: () => cached,
      }),
    ).resolves.toEqual({ status: "stale", data: cached });
  });
});
