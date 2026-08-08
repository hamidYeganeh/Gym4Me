export const authAccountKeys = {
  all: ["auth", "account"] as const,
  session: () => [...authAccountKeys.all, "session"] as const,
};
