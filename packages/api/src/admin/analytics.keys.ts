export const adminAnalyticsKeys = {
  all: ["admin", "analytics"] as const,
  overview: () => [...adminAnalyticsKeys.all, "overview"] as const,
};
