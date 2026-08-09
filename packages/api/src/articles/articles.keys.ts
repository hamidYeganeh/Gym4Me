import type { ListArticleCommentsQuery, ListArticlesQuery } from "./articles.dto";

export const articlesKeys = {
  all: ["articles"] as const,
  lists: () => [...articlesKeys.all, "list"] as const,
  list: (query: ListArticlesQuery = {}) =>
    [...articlesKeys.lists(), query] as const,
  details: () => [...articlesKeys.all, "detail"] as const,
  detail: (slug: string) => [...articlesKeys.details(), slug] as const,
  related: (slug: string) => [...articlesKeys.all, "related", slug] as const,
  comments: (slug: string, query: ListArticleCommentsQuery = {}) =>
    [...articlesKeys.all, "comments", slug, query] as const,
  viewerState: (articleId: string) =>
    [...articlesKeys.all, "viewer", articleId] as const,
};
