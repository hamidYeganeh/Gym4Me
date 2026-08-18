/** Public choice groups (`/basics/choices`). */
export const basicsChoicesEndpoints = {
  list: "/basics/choices",
  units: "/basics/choices/units",
  byKey: (key: string) => `/basics/choices/${encodeURIComponent(key)}`,
} as const;
