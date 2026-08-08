"use client";

import { useMemo } from "react";
import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useApiClient } from "../react";
import type { LocationNode, Paginated, SportNode } from "../types";
import {
  createBasicsLocationsApi,
  type BasicsLocationsApi,
} from "./locations.client";
import type { LocationChildrenResponse } from "./locations.dto";
import { basicsLocationsKeys } from "./locations.keys";
import {
  createBasicsSportsApi,
  type BasicsSportsApi,
} from "./sports.client";
import type { ListSportsQuery, SportChildrenResponse } from "./sports.dto";
import { basicsSportsKeys } from "./sports.keys";

function useBasicsLocationsApi(): BasicsLocationsApi {
  const client = useApiClient();
  return useMemo(() => createBasicsLocationsApi(client), [client]);
}

function useBasicsSportsApi(): BasicsSportsApi {
  const client = useApiClient();
  return useMemo(() => createBasicsSportsApi(client), [client]);
}

export function useBasicsCountries(
  options?: Omit<
    UseQueryOptions<Paginated<LocationNode>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsLocationsApi();
  return useQuery({
    queryKey: basicsLocationsKeys.countries(),
    queryFn: () => api.listCountries(),
    ...options,
  });
}

export function useBasicsProvinces(
  countryId: string,
  options?: Omit<
    UseQueryOptions<LocationChildrenResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsLocationsApi();
  return useQuery({
    queryKey: basicsLocationsKeys.provinces(countryId),
    queryFn: () => api.listProvinces(countryId),
    enabled: Boolean(countryId),
    ...options,
  });
}

export function useBasicsCities(
  provinceId: string,
  options?: Omit<
    UseQueryOptions<LocationChildrenResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsLocationsApi();
  return useQuery({
    queryKey: basicsLocationsKeys.cities(provinceId),
    queryFn: () => api.listCities(provinceId),
    enabled: Boolean(provinceId),
    ...options,
  });
}

export function useBasicsSportCategories(
  options?: Omit<
    UseQueryOptions<Paginated<SportNode>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsSportsApi();
  return useQuery({
    queryKey: basicsSportsKeys.categories(),
    queryFn: () => api.listCategories(),
    ...options,
  });
}

export function useBasicsSports(
  query: ListSportsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<SportNode>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsSportsApi();
  return useQuery({
    queryKey: basicsSportsKeys.sports(query),
    queryFn: () => api.listSports(query),
    ...options,
  });
}

export function useBasicsCategorySports(
  categoryId: string,
  options?: Omit<
    UseQueryOptions<SportChildrenResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsSportsApi();
  return useQuery({
    queryKey: basicsSportsKeys.categorySports(categoryId),
    queryFn: () => api.listCategorySports(categoryId),
    enabled: Boolean(categoryId),
    ...options,
  });
}
