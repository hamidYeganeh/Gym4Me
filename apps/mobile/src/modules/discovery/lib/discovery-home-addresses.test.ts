import { describe, expect, it } from "@jest/globals";
import type { PublicUser } from "@repo/api";
import { buildDiscoveryAddresses } from "./discovery-home-addresses";

const labels = {
  profile: "آدرس پروفایل",
  home: "خانه",
  work: "محل کار",
  gym: "باشگاه",
  other: "سایر",
};

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
    credentials: { password: "set" },
    avatar: { mediaId: null },
    kyc: { status: "none", verifiedAt: null },
    name: { first: null, last: null },
    demographics: { birthDate: null, gender: null },
    address: {
      apartment: null,
      city: null,
      point: null,
      postalCode: null,
      provinceId: null,
      street: null,
    },
    ...overrides,
  };
}

describe("buildDiscoveryAddresses", () => {
  it("uses saved favourite locations and skips production mocks", () => {
    const addresses = buildDiscoveryAddresses(
      user({
        favouriteLocations: [
          {
            id: "loc-home",
            kind: "home",
            label: null,
            address: {
              apartment: null,
              city: "تهران",
              point: null,
              postalCode: null,
              provinceId: null,
              street: "سعادت‌آباد",
            },
          },
        ],
      }),
      labels,
    );
    expect(addresses).toEqual([
      {
        id: "loc-home",
        label: "خانه",
        line: "سعادت‌آباد، تهران",
        city: "تهران",
      },
    ]);
  });

  it("falls back to the profile home address when no favourites exist", () => {
    const addresses = buildDiscoveryAddresses(
      user({
        address: {
          apartment: "۱۲",
          city: "اصفهان",
          point: null,
          postalCode: null,
          provinceId: null,
          street: "چهارباغ",
        },
      }),
      labels,
    );
    expect(addresses).toEqual([
      {
        id: "profile",
        label: "آدرس پروفایل",
        line: "چهارباغ، ۱۲، اصفهان",
        city: "اصفهان",
      },
    ]);
  });

  it("returns an empty list when the user has no saved places", () => {
    expect(buildDiscoveryAddresses(user(), labels)).toEqual([]);
    expect(buildDiscoveryAddresses(null, labels)).toEqual([]);
  });
});
