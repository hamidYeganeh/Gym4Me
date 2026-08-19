export const accountRolesKeys = {
  all: ["account", "roles"] as const,
  overview: () => [...accountRolesKeys.all, "overview"] as const,
};
