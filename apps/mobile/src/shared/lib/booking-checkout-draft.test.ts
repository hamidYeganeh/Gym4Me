import {
  clearBookingCheckoutDraft,
  readBookingCheckoutDraft,
  saveBookingCheckoutDraft,
} from "./booking-checkout-draft";

describe("booking checkout draft", () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };

  beforeEach(() => {
    data.clear();
    clearBookingCheckoutDraft(storage);
  });

  it("round-trips a valid short-lived hold", () => {
    const draft = {
      holdToken: "x".repeat(40),
      holdExpiresAt: "2026-09-02T10:00:00.000Z",
      branchId: "507f1f77bcf86cd799439011",
      offeringId: "507f191e810c19729de860ea",
      offeringName: "جلسه بدنسازی",
      startsAt: "2026-09-02T09:00:00.000Z",
      totalMinor: "1200000",
      currency: "IRR",
    };
    saveBookingCheckoutDraft(draft, storage);
    expect(readBookingCheckoutDraft(storage)).toEqual(draft);
  });

  it("fails closed for malformed ids or hold tokens", () => {
    storage.setItem(
      "gym4me.booking.checkout.v2",
      JSON.stringify({ holdToken: "short", branchId: "bad" }),
    );
    expect(readBookingCheckoutDraft(storage)).toBeNull();
  });
});
