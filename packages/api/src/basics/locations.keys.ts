export const basicsLocationsKeys = {
  all: ["basics", "locations"] as const,
  countries: () => [...basicsLocationsKeys.all, "countries"] as const,
  provinces: (countryId: string) =>
    [...basicsLocationsKeys.all, "provinces", countryId] as const,
  cities: (provinceId: string) =>
    [...basicsLocationsKeys.all, "cities", provinceId] as const,
  districts: (cityId: string) =>
    [...basicsLocationsKeys.all, "districts", cityId] as const,
  detail: (id: string) => [...basicsLocationsKeys.all, "detail", id] as const,
};
