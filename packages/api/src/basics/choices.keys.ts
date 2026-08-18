export const basicsChoicesKeys = {
  all: ["basics", "choices"] as const,
  list: () => [...basicsChoicesKeys.all, "list"] as const,
  detail: (key: string) => [...basicsChoicesKeys.all, "detail", key] as const,
  units: () => [...basicsChoicesKeys.all, "units"] as const,
};
