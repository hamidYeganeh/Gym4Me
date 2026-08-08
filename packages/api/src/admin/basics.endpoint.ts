/** Admin reference-data management (`/admin/basics`). */
export const adminBasicsEndpoints = {
  choices: "/admin/basics/choices",
  choiceByKey: (key: string) =>
    `/admin/basics/choices/${encodeURIComponent(key)}`,
  location: "/admin/basics/location",
  locationById: (id: string) => `/admin/basics/location/${id}`,
  sport: "/admin/basics/sport",
  sportById: (id: string) => `/admin/basics/sport/${id}`,
  ref: (type: string) => `/admin/basics/ref/${encodeURIComponent(type)}`,
  refById: (type: string, id: string) =>
    `/admin/basics/ref/${encodeURIComponent(type)}/${id}`,
} as const;
