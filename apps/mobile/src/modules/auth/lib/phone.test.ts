import { describe, expect, it } from "@jest/globals";
import { maskPhoneForDisplay } from "./phone";

describe("maskPhoneForDisplay", () => {
  it("masks E.164 Iranian numbers as +989XX****XXX", () => {
    expect(maskPhoneForDisplay("+989383729627")).toContain("+98938****627");
  });

  it("normalizes local numbers before masking", () => {
    expect(maskPhoneForDisplay("09383729627")).toContain("+98938****627");
  });

  it("returns short values unchanged apart from bidi isolates", () => {
    expect(maskPhoneForDisplay("1234")).toBe("\u20661234\u2069");
  });
});
