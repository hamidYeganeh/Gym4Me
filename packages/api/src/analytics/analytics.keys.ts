export const analyticsKeys = {
  all: ["analytics"] as const,
  attribution: () => [...analyticsKeys.all, "attribution"] as const,
};
