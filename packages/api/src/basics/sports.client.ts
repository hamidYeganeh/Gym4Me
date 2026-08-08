import type { ApiClient } from "../client";
import type { Paginated, SportNode } from "../types";
import type { ListSportsQuery, SportChildrenResponse } from "./sports.dto";
import { basicsSportsEndpoints as ep } from "./sports.endpoint";

/** Public sport hierarchy (`/basics/ref/sport*`). */
export function createBasicsSportsApi(client: ApiClient) {
  return {
    listCategories() {
      return client.request<Paginated<SportNode>>(ep.categories, {
        public: true,
      });
    },

    getCategory(id: string) {
      return client.request<SportNode>(ep.categoryById(id), { public: true });
    },

    listCategorySports(categoryId: string) {
      return client.request<SportChildrenResponse>(
        ep.categorySports(categoryId),
        { public: true },
      );
    },

    listSports(query: ListSportsQuery = {}) {
      return client.request<Paginated<SportNode>>(ep.sports, {
        query,
        public: true,
      });
    },

    getSport(id: string) {
      return client.request<SportNode>(ep.sportById(id), { public: true });
    },

    listSportBranches(sportId: string) {
      return client.request<SportChildrenResponse>(ep.sportBranches(sportId), {
        public: true,
      });
    },
  };
}

export type BasicsSportsApi = ReturnType<typeof createBasicsSportsApi>;
