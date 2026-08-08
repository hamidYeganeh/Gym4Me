/** Public location tree (`/basics/location`). */
export const basicsLocationsEndpoints = {
  countries: "/basics/location/country",
  countryById: (id: string) => `/basics/location/country/${id}`,
  provinces: (countryId: string) =>
    `/basics/location/country/${countryId}/provinces`,
  provinceById: (id: string) => `/basics/location/province/${id}`,
  cities: (provinceId: string) =>
    `/basics/location/province/${provinceId}/cities`,
  cityById: (id: string) => `/basics/location/city/${id}`,
  districts: (cityId: string) => `/basics/location/city/${cityId}/districts`,
  districtById: (id: string) => `/basics/location/district/${id}`,
} as const;
