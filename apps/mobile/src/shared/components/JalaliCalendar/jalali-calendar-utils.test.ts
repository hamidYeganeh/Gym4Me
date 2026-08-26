import { toJalaliCalendarDate } from "./jalali-calendar-utils";

describe("Jalali calendar timezone boundary", () => {
  it("renders a UTC instant using the Asia/Tehran civil date", () => {
    const value = toJalaliCalendarDate(new Date("2026-03-20T21:00:00.000Z"));
    expect(value).toMatchObject({ year: 1405, month: 1, day: 1 });
  });

  it("rejects an invalid Date", () => {
    expect(toJalaliCalendarDate(new Date("invalid"))).toBeUndefined();
  });
});
