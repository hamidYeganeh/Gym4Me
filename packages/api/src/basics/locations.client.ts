import type { ApiClient } from "../client";
import type { LocationNode, Paginated } from "../types";
import type { LocationChildrenResponse } from "./locations.dto";
import { basicsLocationsEndpoints as ep } from "./locations.endpoint";

/** Public location hierarchy (`/basics/location`). */
export function createBasicsLocationsApi(client: ApiClient) {
  return {
    listCountries() {
      return client.request<Paginated<LocationNode>>(ep.countries, {
        public: true,
      });
    },

    getCountry(id: string) {
      return client.request<LocationNode>(ep.countryById(id), { public: true });
    },

    listProvinces(countryId: string) {
      return client.request<LocationChildrenResponse>(ep.provinces(countryId), {
        public: true,
      });
    },

    getProvince(id: string) {
      return client.request<LocationNode>(ep.provinceById(id), {
        public: true,
      });
    },

    listCities(provinceId: string) {
      return client.request<LocationChildrenResponse>(ep.cities(provinceId), {
        public: true,
      });
    },

    getCity(id: string) {
      return client.request<LocationNode>(ep.cityById(id), { public: true });
    },

    listDistricts(cityId: string) {
      return client.request<LocationChildrenResponse>(ep.districts(cityId), {
        public: true,
      });
    },

    getDistrict(id: string) {
      return client.request<LocationNode>(ep.districtById(id), {
        public: true,
      });
    },
  };
}

export type BasicsLocationsApi = ReturnType<typeof createBasicsLocationsApi>;
