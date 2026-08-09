/** Admin articles (`/admin/articles`). */
export const adminArticlesEndpoints = {
  root: "/admin/articles",
  byId: (id: string) => `/admin/articles/${id}`,
} as const;
