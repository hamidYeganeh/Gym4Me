import type { PublicAddress, PublicUser } from "@repo/api";

export const MAX_HOME_DISTRICT_CLUBS = 8;

export type UserDiscoveryAddress = {
  provinceId: string | null;
  city: string | null;
  street: string | null;
};

export type NamedLocation = {
  id: string;
  name: string;
};

export type ResolvedDiscoveryArea = {
  locationId: string;
  name: string;
  kind: "district" | "city";
};

function hasUsableAddress(address: PublicAddress): boolean {
  return Boolean(
    address.provinceId || address.city?.trim() || address.street?.trim(),
  );
}

/** First favourite with a usable address, otherwise the profile address. */
export function addressFromUser(
  user: PublicUser | null,
): UserDiscoveryAddress | null {
  if (!user) return null;

  for (const location of user.favouriteLocations ?? []) {
    if (hasUsableAddress(location.address)) {
      return {
        provinceId: location.address.provinceId,
        city: location.address.city,
        street: location.address.street,
      };
    }
  }

  if (!hasUsableAddress(user.address)) return null;
  return {
    provinceId: user.address.provinceId,
    city: user.address.city,
    street: user.address.street,
  };
}

export function normalizeLocationName(value: string): string {
  return value
    .trim()
    .replace(/\u200c/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/آ/g, "ا")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function matchLocationByName<T extends { name: string }>(
  items: readonly T[],
  query: string | null | undefined,
): T | null {
  const needle = query ? normalizeLocationName(query) : "";
  if (!needle) return null;

  const exact = items.find(
    (item) => normalizeLocationName(item.name) === needle,
  );
  if (exact) return exact;

  const matches = items.filter((item) => {
    const name = normalizeLocationName(item.name);
    return name.includes(needle) || needle.includes(name);
  });
  if (matches.length === 0) return null;

  return [...matches].sort((a, b) => b.name.length - a.name.length)[0] ?? null;
}

export function matchDistrictFromAddress<T extends { name: string }>(
  districts: readonly T[],
  address: Pick<UserDiscoveryAddress, "city" | "street">,
): T | null {
  const streetHead = address.street?.split(/[،,]/)[0]?.trim();
  const fromStreet = matchLocationByName(districts, streetHead);
  if (fromStreet) return fromStreet;

  const haystack = normalizeLocationName(
    [address.street, address.city].filter(Boolean).join(" "),
  );
  if (!haystack) return null;

  const contained = districts
    .filter((district) =>
      haystack.includes(normalizeLocationName(district.name)),
    )
    .sort((a, b) => b.name.length - a.name.length);

  return contained[0] ?? matchLocationByName(districts, address.city);
}

export function resolveDiscoveryArea(input: {
  city: NamedLocation | null;
  district: NamedLocation | null;
}): ResolvedDiscoveryArea | null {
  if (input.district) {
    return {
      locationId: input.district.id,
      name: input.district.name,
      kind: "district",
    };
  }
  if (input.city) {
    return {
      locationId: input.city.id,
      name: input.city.name,
      kind: "city",
    };
  }
  return null;
}

export function districtClubsSeeAllHref(locationId: string): string {
  return `/discovery/clubs?locationId=${encodeURIComponent(locationId)}`;
}
