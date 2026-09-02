import { afterEach, describe, expect, it } from "vitest";
import { kavenegarLookupInput } from "../src/notification-dispatcher.js";

const originalTemplate = process.env.KAVENEGAR_TEMPLATE_BOOKING_REMINDER;

afterEach(() => {
  if (originalTemplate === undefined) delete process.env.KAVENEGAR_TEMPLATE_BOOKING_REMINDER;
  else process.env.KAVENEGAR_TEMPLATE_BOOKING_REMINDER = originalTemplate;
});

describe("notification dispatcher", () => {
  it("maps transactional events to approved Kavenegar lookup templates", () => {
    expect(kavenegarLookupInput("booking_confirmed", { bookingId: "507f1f77bcf86cd799439011" })).toEqual({
      template: "gym4mebookingconfirmed",
      token: "507f1f77bcf86cd799439011",
    });
    expect(
      kavenegarLookupInput("payment_failed", { paymentId: "507f191e810c19729de860ea" }),
    ).toEqual({ template: "gym4mepaymentfailed", token: "507f191e810c19729de860ea" });
  });

  it("uses a space-safe Persian-calendar token10 and supports template overrides", () => {
    process.env.KAVENEGAR_TEMPLATE_BOOKING_REMINDER = "customreminder";
    const result = kavenegarLookupInput("booking_reminder", {
      bookingId: "507f1f77bcf86cd799439012",
      startsAt: "2026-09-02T06:00:00.000Z",
    });
    expect(result).toMatchObject({
      template: "customreminder",
      token: "507f1f77bcf86cd799439012",
    });
    expect(result?.token10).toMatch(/^\d{4} \d{2} \d{2} \d{2} \d{2}$/);
  });

  it("keeps free-form announcements on the regular SMS endpoint", () => {
    expect(kavenegarLookupInput("organization_announcement", {})).toBeNull();
  });
});
