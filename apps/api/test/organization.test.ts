import { describe, expect, it } from "vitest";
import { flattenPatch, toStorage } from "../src/modules/organization/entity-mapper.js";
import {
  branchCreateSchema,
  clubCreateSchema,
} from "../src/modules/organization/schemas/organization.schemas.js";

describe("organization contracts", () => {
  it("maps API snake_case fields to nested storage fields", () => {
    expect(
      flattenPatch({
        profile: { legal_name: "Gym Co", contact: { phone: "021" } },
        custom_data: { tier: "gold" },
      }),
    ).toEqual({
      "profile.legalName": "Gym Co",
      "profile.contact.phone": "021",
      "customData.tier": "gold",
    });
    expect(
      toStorage([{ day_of_week: 1, periods: [{ opens_at: "08:00", closes_at: "22:00" }] }]),
    ).toEqual([{ dayOfWeek: 1, periods: [{ opensAt: "08:00", closesAt: "22:00" }] }]);
  });

  it("rejects invalid club slugs and coordinates", () => {
    expect(() =>
      clubCreateSchema.parse({
        organization_id: "507f1f77bcf86cd799439011",
        profile: { name: "Gym", slug: "Bad Slug" },
      }),
    ).toThrow();
    expect(() =>
      branchCreateSchema.parse({
        profile: { name: "Main", slug: "main" },
        location: { latitude: 100, longitude: 51 },
      }),
    ).toThrow();
  });
});
