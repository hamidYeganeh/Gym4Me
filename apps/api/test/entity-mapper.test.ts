import { describe, expect, it } from "vitest";
import { toStorage } from "../src/modules/organization/entity-mapper.js";

describe("entity mapper", () => {
  it("maps the complete supply contract to persisted camelCase fields", () => {
    expect(
      toStorage({
        branch_ids: ["branch"],
        resource_requirements: [{ resource_id: "resource" }],
        profile: { service_mode: "in_person" },
        pricing: { base_amount: 500_000, pricing_mode: "per_booking", tax_included: false },
        booking_settings: {
          duration_minutes: 60,
          booking_window_days: 30,
          minimum_advance_minutes: 0,
          cancellation_window_minutes: 120,
          allow_recurring: true,
          allow_group: true,
          allow_family: true,
        },
      }),
    ).toEqual({
      branchIds: ["branch"],
      resourceRequirements: [{ resourceId: "resource" }],
      profile: { serviceMode: "in_person" },
      pricing: { baseAmount: 500_000, pricingMode: "per_booking", taxIncluded: false },
      bookingSettings: {
        durationMinutes: 60,
        bookingWindowDays: 30,
        minimumAdvanceMinutes: 0,
        cancellationWindowMinutes: 120,
        allowRecurring: true,
        allowGroup: true,
        allowFamily: true,
      },
    });
  });
});
