export const basicsChoicesKeys = {
  all: ["basics", "choices"] as const,
  list: () => [...basicsChoicesKeys.all, "list"] as const,
  detail: (key: string) => [...basicsChoicesKeys.all, "detail", key] as const,
  units: () => [...basicsChoicesKeys.all, "units"] as const,
};

/** Choice catalogs change rarely — default client cache window. */
export const BASICS_CHOICES_STALE_TIME_MS = 4 * 60 * 60 * 1000;
