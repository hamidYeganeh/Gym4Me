/** Public flat refs (`/basics/ref/:type`). */
export const basicsRefsEndpoints = {
  list: (type: string) => `/basics/ref/${encodeURIComponent(type)}`,
  byId: (type: string, id: string) =>
    `/basics/ref/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
} as const;
