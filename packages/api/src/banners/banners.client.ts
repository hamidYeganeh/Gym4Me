import type { ApiClient } from "../client";
import type { Banner, ListBannersQuery } from "./banners.dto";
import { bannersEndpoints as ep } from "./banners.endpoint";

/** Public promo banners per placement. */
export function createBannersApi(client: ApiClient) {
  return {
    list(query: ListBannersQuery) {
      return client.request<Banner[]>(ep.root, {
        query,
        public: true,
      });
    },
  };
}

export type BannersApi = ReturnType<typeof createBannersApi>;
