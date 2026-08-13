export const accountLifecycleKeys = {
  all: ["account", "lifecycle"] as const,
  segments: (clubId: string) =>
    [...accountLifecycleKeys.all, "segments", clubId] as const,
  atRisk: (clubId: string) =>
    [...accountLifecycleKeys.all, "at-risk", clubId] as const,
  journeys: (clubId: string) =>
    [...accountLifecycleKeys.all, "journeys", clubId] as const,
};
