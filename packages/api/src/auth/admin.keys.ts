export const authAdminKeys = {
  all: ["auth", "admin"] as const,
  session: () => [...authAdminKeys.all, "session"] as const,
};
