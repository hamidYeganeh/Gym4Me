import { createInFlightRequestDeduper } from "./in-flight-request";

describe("createInFlightRequestDeduper", () => {
  it("shares one in-flight request for the same key", async () => {
    let resolveRequest!: (value: string) => void;
    const request = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const run = createInFlightRequestDeduper<string>();

    const first = run("discovery:guest", request);
    const second = run("discovery:guest", request);
    resolveRequest("feed");

    await expect(first).resolves.toBe("feed");
    await expect(second).resolves.toBe("feed");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("allows a fresh request after the previous one settles", async () => {
    const request = jest.fn().mockResolvedValue("feed");
    const run = createInFlightRequestDeduper<string>();

    await run("discovery:guest", request);
    await run("discovery:guest", request);

    expect(request).toHaveBeenCalledTimes(2);
  });
});
