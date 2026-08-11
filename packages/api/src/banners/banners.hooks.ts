import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { BannerPlacement } from "../types";
import { createBannersApi, type BannersApi } from "./banners.client";
import type { Banner } from "./banners.dto";
import { bannersKeys } from "./banners.keys";

function useBannersApi(): BannersApi {
  const client = useApiClient();
  return useMemo(() => createBannersApi(client), [client]);
}

export function useBanners(
  placement: BannerPlacement,
  options?: Omit<UseQueryOptions<Banner[], Error>, "queryKey" | "queryFn">,
) {
  const api = useBannersApi();
  return useQuery({
    queryKey: bannersKeys.list(placement),
    queryFn: () => api.list({ placement }),
    ...options,
  });
}
