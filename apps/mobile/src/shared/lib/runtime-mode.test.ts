import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  resolveDemoMode,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "./runtime-mode";

describe("resolveDemoMode", () => {
  it("enables explicit demo mode in development", () => {
    expect(resolveDemoMode("development", "true")).toBe(true);
  });

  it("keeps demo mode disabled by default", () => {
    expect(resolveDemoMode("development", undefined)).toBe(false);
    expect(resolveDemoMode("test", "false")).toBe(false);
  });

  it("cannot enable demo mode in production", () => {
    expect(resolveDemoMode("production", "true")).toBe(false);
  });
});

describe("canUseDemoFixtureId", () => {
  it("rejects fixture navigation when demo mode is disabled", () => {
    expect(canUseDemoFixtureId("inv-demo", false)).toBe(false);
  });

  it("allows fixture ids only in explicit demo mode", () => {
    expect(canUseDemoFixtureId("inv-demo", true)).toBe(true);
    expect(canUseDemoFixtureId("665f0a1b2c3d4e5f67890101", true)).toBe(false);
  });
});

describe("buildDemoStaticParams", () => {
  it("does not prerender fixture params outside demo mode", () => {
    const build = jest.fn(() => [{ clubId: "heavenly" }]);
    const productionParams = [{ clubId: STATIC_EXPORT_PLACEHOLDER_ID }];

    expect(buildDemoStaticParams(build, productionParams, false)).toEqual(
      productionParams,
    );
    expect(build).not.toHaveBeenCalled();
    expect(buildDemoStaticParams(build, productionParams, true)).toEqual([
      { clubId: "heavenly" },
    ]);
  });
});
