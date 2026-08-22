import { describe, expect, it } from "@jest/globals";
import type { PublicUser } from "@repo/api";
import {
  nearbyClubSubtitle,
  originFromUser,
} from "./nearby-clubs-home";

function user(overrides: Partial<PublicUser> = {}): PublicUser {
  return {
    id: "user-1",
    phone: "+989120000000",
    phoneVerifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    code: null,
    nationalId: null,
    referralCode: null,
    roles: ["athlete"],
    status: "active",
    favouriteLocations: [],
    avatar: { mediaId: null },
    kyc: { status: "none", verifiedAt: null },
    name: { first: "مهدی", last: null },
    demographics: { gender: null, birthDate: null },
    address: {
      apartment: null,
      city: "تهران",
      point: null,
      postalCode: null,
      provinceId: null,
      street: null,
    },
    ...overrides,
  };
}

describe("originFromUser", () => {
  it("prefers the first favourite location with a point", () => {
    expect(
      originFromUser(
        user({
          address: {
            provinceId: null,
            city: "تهران",
            street: null,
            apartment: null,
            postalCode: null,
            point: { lat: 35.7, lng: 51.4 },
          },
          favouriteLocations: [
            {
              id: "home",
              kind: "home",
              label: "خانه",
              address: {
                provinceId: null,
                city: "تهران",
                street: "ولیعصر",
                apartment: null,
                postalCode: null,
                point: { lat: 35.71, lng: 51.41 },
              },
            },
          ],
        }),
      ),
    ).toEqual({ lat: 35.71, lng: 51.41 });
  });

  it("falls back to the profile address point", () => {
    expect(
      originFromUser(
        user({
          address: {
            provinceId: null,
            city: "اصفهان",
            street: null,
            apartment: null,
            postalCode: null,
            point: { lat: 32.65, lng: 51.67 },
          },
        }),
      ),
    ).toEqual({ lat: 32.65, lng: 51.67 });
  });

  it("returns null when no saved coordinate exists", () => {
    expect(originFromUser(user())).toBeNull();
  });
});

describe("nearbyClubSubtitle", () => {
  it("prefixes the address with a distance label", () => {
    expect(nearbyClubSubtitle("تهران، ونک", "۱٫۲ کیلومتر")).toBe(
      "۱٫۲ کیلومتر · تهران، ونک",
    );
  });
});
