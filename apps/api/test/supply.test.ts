import { describe, expect, it } from "vitest";
import { materializeSlots } from "../src/modules/supply/slot-materializer.js";
import {
  availabilityRuleSchema,
  offeringCreateSchema,
  resourceCreateSchema,
  slotQuerySchema,
} from "../src/modules/supply/schemas/supply.schemas.js";

describe("supply contracts", () => {
  it("validates nested resource and offering invariants", () => {
    expect(() =>
      resourceCreateSchema.parse({
        type: "hall",
        profile: { name: "Main hall", slug: "main-hall" },
        capacity: { total: 10, maximum_participants: 12 },
      }),
    ).toThrow();
    expect(() =>
      offeringCreateSchema.parse({
        branch_ids: ["507f1f77bcf86cd799439011"],
        profile: { name: "Class", slug: "class", type: "group_class" },
        pricing: { base_amount: 1000 },
        capacity: { minimum: 20, maximum: 10 },
        booking_settings: { duration_minutes: 60 },
      }),
    ).toThrow();
    expect(
      availabilityRuleSchema.parse({
        schedule: { day_of_week: 1, periods: [{ starts_at: "08:00", ends_at: "10:00" }] },
      }).status,
    ).toBe("active");
  });

  it("limits availability searches to 31 days", () => {
    expect(() =>
      slotQuerySchema.parse({ from: "2026-09-01T00:00:00Z", to: "2026-11-01T00:00:00Z" }),
    ).toThrow();
  });

  it("materializes slots and applies closures and reservations", () => {
    const slots = materializeSlots({
      from: new Date("2026-08-31T00:00:00Z"),
      to: new Date("2026-09-01T00:00:00Z"),
      timeZone: "UTC",
      durationMinutes: 60,
      participants: 2,
      defaultCapacity: 4,
      rules: [
        {
          schedule: { dayOfWeek: 1, periods: [{ startsAt: "08:00", endsAt: "11:00" }] },
          capacity: { total: 4 },
        },
      ],
      exceptions: [
        {
          type: "closed",
          period: {
            startsAt: new Date("2026-08-31T09:00:00Z"),
            endsAt: new Date("2026-08-31T10:00:00Z"),
          },
          reason: "maintenance",
        },
      ],
      reservations: [
        {
          startAt: new Date("2026-08-31T08:00:00Z"),
          endAt: new Date("2026-08-31T09:00:00Z"),
          quantity: 3,
        },
      ],
    });
    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.status)).toEqual(["full", "closed", "available"]);
    expect(slots[0]?.capacity.available).toBe(1);
  });
});
