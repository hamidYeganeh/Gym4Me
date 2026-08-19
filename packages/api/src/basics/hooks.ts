"use client";

import { useMemo } from "react";
import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useApiClient } from "../react";
import type { LocationNode, Paginated, RefType, SportNode } from "../types";
import {
  createBasicsChoicesApi,
  type BasicsChoicesApi,
} from "./choices.client";
import type { PublicChoiceGroup } from "./choices.dto";
import { basicsChoicesKeys, BASICS_CHOICES_STALE_TIME_MS } from "./choices.keys";
import {
  createBasicsLocationsApi,
  type BasicsLocationsApi,
} from "./locations.client";
import type { LocationChildrenResponse } from "./locations.dto";
import { basicsLocationsKeys } from "./locations.keys";
import {
  createBasicsRefsApi,
  type BasicsRefsApi,
} from "./refs.client";
import type { BasicsRefListResponse } from "./refs.dto";
import { basicsRefsKeys } from "./refs.keys";
import {
  createBasicsSportsApi,
  type BasicsSportsApi,
} from "./sports.client";
import type { ListSportsQuery, SportChildrenResponse } from "./sports.dto";
import { basicsSportsKeys } from "./sports.keys";

function useBasicsChoicesApi(): BasicsChoicesApi {
  const client = useApiClient();
  return useMemo(() => createBasicsChoicesApi(client), [client]);
}

function useBasicsLocationsApi(): BasicsLocationsApi {
  const client = useApiClient();
  return useMemo(() => createBasicsLocationsApi(client), [client]);
}

function useBasicsSportsApi(): BasicsSportsApi {
  const client = useApiClient();
  return useMemo(() => createBasicsSportsApi(client), [client]);
}

function useBasicsRefsApi(): BasicsRefsApi {
  const client = useApiClient();
  return useMemo(() => createBasicsRefsApi(client), [client]);
}

export function useBasicsChoiceGroups(
  options?: Omit<
    UseQueryOptions<Paginated<PublicChoiceGroup>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsChoicesApi();
  return useQuery({
    queryKey: basicsChoicesKeys.list(),
    queryFn: () => api.list(),
    staleTime: BASICS_CHOICES_STALE_TIME_MS,
    gcTime: BASICS_CHOICES_STALE_TIME_MS,
    ...options,
  });
}

export function useBasicsChoiceGroup(
  key: string,
  options?: Omit<
    UseQueryOptions<PublicChoiceGroup, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsChoicesApi();
  return useQuery({
    queryKey: basicsChoicesKeys.detail(key),
    queryFn: async () => {
      const groups = await api.listAll();
      const group = groups.find((item) => item.value === key);
      if (!group) throw new Error(`Choice group not found: ${key}`);
      return group;
    },
    enabled: Boolean(key),
    staleTime: BASICS_CHOICES_STALE_TIME_MS,
    gcTime: BASICS_CHOICES_STALE_TIME_MS,
    ...options,
  });
}

export function useBasicsUnitChoiceGroups(
  options?: Omit<
    UseQueryOptions<PublicChoiceGroup[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsChoicesApi();
  return useQuery({
    queryKey: basicsChoicesKeys.units(),
    queryFn: () => api.listUnitGroups(),
    staleTime: BASICS_CHOICES_STALE_TIME_MS,
    gcTime: BASICS_CHOICES_STALE_TIME_MS,
    ...options,
  });
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

export function useBasicsRefs(
  type: RefType,
  options?: Omit<
    UseQueryOptions<BasicsRefListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useBasicsRefsApi();
  return useQuery({
    queryKey: basicsRefsKeys.list(type),
    queryFn: () => api.list(type),
    ...options,
  });
}
