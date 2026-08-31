import { describe, expect, it } from "@jest/globals";
import type { PublicUser } from "@repo/api";
import {
  addressFromUser,
  districtClubsSeeAllHref,
  matchDistrictFromAddress,
  matchLocationByName,
  normalizeLocationName,
  resolveDiscoveryArea,
} from "./district-clubs-home";

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
    name: { first: "مهدی", last: null },
    demographics: { gender: null, birthDate: null },
    address: {
      apartment: null,
      city: null,
      district: null,
      point: null,
      postalCode: null,
      provinceId: null,
      street: null,
    },
    ...overrides,
  };
}

const districts = [
  { id: "vanak", name: "ونک" },
  { id: "saadat", name: "سعادت‌آباد" },
  { id: "niavaran", name: "نیاوران" },
];

describe("addressFromUser", () => {
  it("prefers the first favourite with a usable address", () => {
    expect(
      addressFromUser(
        user({
          address: {
            provinceId: "prov-profile",
            city: "اصفهان",
            district: null,
            street: "چهارباغ",
            apartment: null,
            postalCode: null,
            point: null,
          },
          favouriteLocations: [
            {
              id: "home",
              kind: "home",
              label: "خانه",
              address: {
                provinceId: "prov-tehran",
                city: "تهران",
                district: null,
                street: "سعادت‌آباد",
                apartment: null,
                postalCode: null,
                point: null,
              },
            },
          ],
        }),
      ),
    ).toEqual({
      provinceId: "prov-tehran",
      city: "تهران",
      street: "سعادت‌آباد",
    });
  });

  it("falls back to the profile address", () => {
    expect(
      addressFromUser(
        user({
          address: {
            provinceId: null,
            city: "شیراز",
            district: null,
            street: null,
            apartment: null,
            postalCode: null,
            point: null,
          },
        }),
      ),
    ).toEqual({
      provinceId: null,
      city: "شیراز",
      street: null,
    });
  });

  it("returns null when no city, street, or province is saved", () => {
    expect(addressFromUser(user())).toBeNull();
    expect(addressFromUser(null)).toBeNull();
  });
});

describe("normalizeLocationName", () => {
  it("collapses zwnj, arabic letters, and extra spaces", () => {
    expect(normalizeLocationName("سعادت‌آباد")).toBe(
      normalizeLocationName("سعادت آباد"),
    );
  });
});

describe("matchLocationByName", () => {
  it("matches exact and contained names, preferring the longest", () => {
    expect(matchLocationByName(districts, "سعادت‌آباد")?.id).toBe("saadat");
    expect(
      matchLocationByName(
        [
          { id: "abad", name: "آباد" },
          { id: "saadat", name: "سعادت‌آباد" },
        ],
        "سعادت آباد",
      )?.id,
    ).toBe("saadat");
  });
});

describe("matchDistrictFromAddress", () => {
  it("matches the first street segment to a district", () => {
    expect(
      matchDistrictFromAddress(districts, {
        city: "تهران",
        street: "سعادت‌آباد، بلوار دریا",
      })?.id,
    ).toBe("saadat");
  });

  it("finds a district name later in the street line", () => {
    expect(
      matchDistrictFromAddress(districts, {
        city: "تهران",
        street: "خیابان ولیعصر، ونک",
      })?.id,
    ).toBe("vanak");
  });

  it("uses the city field when it is a district name", () => {
    expect(
      matchDistrictFromAddress(districts, {
        city: "نیاوران",
        street: null,
      })?.id,
    ).toBe("niavaran");
  });
});

describe("resolveDiscoveryArea", () => {
  it("prefers the district over the city", () => {
    expect(
      resolveDiscoveryArea({
        city: { id: "tehran", name: "تهران" },
        district: { id: "saadat", name: "سعادت‌آباد" },
      }),
    ).toEqual({
      locationId: "saadat",
      name: "سعادت‌آباد",
      kind: "district",
    });
  });

  it("falls back to the city when no district matches", () => {
    expect(
      resolveDiscoveryArea({
        city: { id: "tehran", name: "تهران" },
        district: null,
      }),
    ).toEqual({
      locationId: "tehran",
      name: "تهران",
      kind: "city",
    });
  });

  it("returns null when neither city nor district is known", () => {
    expect(resolveDiscoveryArea({ city: null, district: null })).toBeNull();
  });
});

describe("districtClubsSeeAllHref", () => {
  it("scopes the clubs browse to the resolved location", () => {
    expect(districtClubsSeeAllHref("saadat")).toBe(
      "/discovery/clubs?locationId=saadat",
    );
  });
});
