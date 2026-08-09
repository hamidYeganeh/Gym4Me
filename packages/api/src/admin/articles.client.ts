import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  AdminArticle,
  CreateArticleInput,
  ListAdminArticlesQuery,
  UpdateArticleInput,
} from "./articles.dto";
import { adminArticlesEndpoints as ep } from "./articles.endpoint";

/** Admin article management. */
export function createAdminArticlesApi(client: ApiClient) {
  return {
    list(query: ListAdminArticlesQuery = {}) {
      return client.request<Paginated<AdminArticle>>(ep.root, { query });
    },

    get(id: string) {
      return client.request<AdminArticle>(ep.byId(id));
    },

    create(input: CreateArticleInput) {
      return client.request<AdminArticle>(ep.root, {
        method: "POST",
        body: input,
      });
    },

    update(id: string, input: UpdateArticleInput) {
      return client.request<AdminArticle>(ep.byId(id), {
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

export type AdminArticlesApi = ReturnType<typeof createAdminArticlesApi>;
