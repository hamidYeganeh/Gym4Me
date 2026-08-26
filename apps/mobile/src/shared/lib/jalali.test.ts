import {
  isoToJalaliDisplay,
  jalaliDisplayToIso,
  toGregorian,
  toJalali,
} from "./jalali";

describe("Jalali transport boundary", () => {
  it("round-trips Nowruz through Gregorian ISO", () => {
    expect(jalaliDisplayToIso("۱۴۰۵/۰۱/۰۱")).toBe("2026-03-21");
    expect(isoToJalaliDisplay("2026-03-21")).toBe("1405/01/01");
  });

  it("accepts Arabic digits and normalizes transport to ASCII", () => {
    expect(jalaliDisplayToIso("١٤٠٥-١-١")).toBe("2026-03-21");
  });

  it("rejects impossible Esfand and month dates", () => {
    expect(jalaliDisplayToIso("1400/12/30")).toBeNull();
    expect(jalaliDisplayToIso("1405/07/31")).toBeNull();
  });

  it("keeps valid leap-day conversion reversible", () => {
    const gregorian = toGregorian(1399, 12, 30);
    expect(toJalali(gregorian.gy, gregorian.gm, gregorian.gd)).toEqual({
      jy: 1399,
      jm: 12,
      jd: 30,
    });
  });
});
