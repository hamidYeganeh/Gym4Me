import { describe, expect, it } from "@jest/globals";
import { slideHasInnerScroll } from "./onboarding-helpers";

describe("slideHasInnerScroll", () => {
  it("keeps the goals list in a fixed inner scroller", () => {
    expect(slideHasInnerScroll("goals")).toBe(true);
  });

  it("centers the sports grid in the slide stage", () => {
    expect(slideHasInnerScroll("sports")).toBe(false);
  });
});
