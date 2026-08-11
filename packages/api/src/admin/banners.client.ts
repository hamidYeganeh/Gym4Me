import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  AdminBanner,
  CreateBannerInput,
  ListAdminBannersQuery,
  UpdateBannerInput,
} from "./banners.dto";
import { adminBannersEndpoints as ep } from "./banners.endpoint";

/** Admin banner management. */
export function createAdminBannersApi(client: ApiClient) {
  return {
    list(query: ListAdminBannersQuery = {}) {
      return client.request<Paginated<AdminBanner>>(ep.root, { query });
    },

    get(id: string) {
      return client.request<AdminBanner>(ep.byId(id));
    },

    create(input: CreateBannerInput) {
      return client.request<AdminBanner>(ep.root, {
        method: "POST",
        body: input,
      });
    },

    update(id: string, input: UpdateBannerInput) {
      return client.request<AdminBanner>(ep.byId(id), {
        method: "PATCH",
        body: input,
      });
    },

    delete(id: string) {
      return client.request<{ deleted: boolean }>(ep.byId(id), {
        method: "DELETE",
      });
    },
  };
}

export type AdminBannersApi = ReturnType<typeof createAdminBannersApi>;
