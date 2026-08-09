/** Public articles (`/articles`). */
export const articlesEndpoints = {
  root: "/articles",
  facets: "/articles/facets",
  bySlug: (slug: string) => `/articles/${encodeURIComponent(slug)}`,
  related: (slug: string) =>
    `/articles/${encodeURIComponent(slug)}/related`,
  commentsBySlug: (slug: string) =>
    `/articles/${encodeURIComponent(slug)}/comments`,
} as const;

/** Authenticated article interactions (`/account/articles`). */
export const accountArticlesEndpoints = {
  state: (articleId: string) => `/account/articles/${articleId}/state`,
  like: (articleId: string) => `/account/articles/${articleId}/like`,
  save: (articleId: string) => `/account/articles/${articleId}/save`,
  comments: (articleId: string) => `/account/articles/${articleId}/comments`,
} as const;
