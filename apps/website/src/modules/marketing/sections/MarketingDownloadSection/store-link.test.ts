import { describe, expect, it } from "@jest/globals";
import { resolveStoreUrl } from "./store-link";

describe("resolveStoreUrl", () => {
  it("normalizes a valid HTTPS store URL", () => {
    expect(resolveStoreUrl("  https://cafebazaar.ir/app/gym4me  ")).toBe(
      "https://cafebazaar.ir/app/gym4me",
    );
  });

  it.each([
    undefined,
    "",
    "not-a-url",
    "http://store.test/app",
    "javascript:alert(1)",
  ])("disables unsafe or missing store target %s", (value) =>
    expect(resolveStoreUrl(value)).toBeUndefined(),
  );
});
